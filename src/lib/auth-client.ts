import { getBaseUrl } from "@/lib/utils"
import type { UserAccount } from "@/server/auth"
import {
  BetterFetchError,
  type BetterFetch,
  type BetterFetchOption
} from "@better-fetch/fetch"
import type { BetterAuthClientPlugin, Session } from "better-auth"
import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { atom, onMount, type PreinitializedWritableAtom } from "nanostores"

const useAuthQuery = <T>(
  initializedAtom:
    | PreinitializedWritableAtom<any>
    | PreinitializedWritableAtom<any>[],
  path: string,
  $fetch: BetterFetch,
  options?:
    | ((value: {
        data: null | T
        error: null | BetterFetchError
        isPending: boolean
      }) => BetterFetchOption)
    | BetterFetchOption
) => {
  const value = atom<{
    data: null | T
    error: null | BetterFetchError
    isPending: boolean
    isRefetching: boolean
    refetch: () => void
  }>({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch: () => {
      return fn()
    }
  })

  const fn = () => {
    const opts =
      typeof options === "function"
        ? options({
            data: value.get().data,
            error: value.get().error,
            isPending: value.get().isPending
          })
        : options

    return $fetch<T>(path, {
      ...opts,
      async onSuccess(context) {
        //to avoid hydration error
        if (typeof window !== "undefined") {
          value.set({
            data: context.data,
            error: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          })
        }
        await opts?.onSuccess?.(context)
      },
      async onError(context) {
        const { request } = context
        const retryAttempts =
          typeof request.retry === "number"
            ? request.retry
            : request.retry?.attempts
        const retryAttempt = request.retryAttempt || 0
        if (retryAttempts && retryAttempt < retryAttempts) return
        value.set({
          error: context.error,
          data: null,
          isPending: false,
          isRefetching: false,
          refetch: value.value.refetch
        })
        await opts?.onError?.(context)
      },
      async onRequest(context) {
        const currentValue = value.get()
        value.set({
          isPending: currentValue.data === null,
          data: currentValue.data,
          error: null,
          isRefetching: true,
          refetch: value.value.refetch
        })
        await opts?.onRequest?.(context)
      }
    })
  }
  initializedAtom = Array.isArray(initializedAtom)
    ? initializedAtom
    : [initializedAtom]
  let isMounted = false
  for (const initAtom of initializedAtom) {
    initAtom.subscribe(() => {
      if (isMounted) {
        fn()
      } else {
        onMount(value, () => {
          fn()
          isMounted = true
          return () => {
            value.off()
            initAtom.off()
          }
        })
      }
    })
  }
  return value
}

export const hooksPlugin = () => {
  const $listSessions = atom<boolean>(false)

  return {
    id: "hooks-plugin",
    getAtoms: ($fetch) => {
      const listSessions = useAuthQuery<Session[]>(
        $listSessions,
        "/list-sessions",
        $fetch,
        {
          method: "GET"
        }
      )

      const $listUserAccounts = atom<boolean>(false)

      const listUserAccounts = useAuthQuery<UserAccount[]>(
        $listUserAccounts,
        "/list-accounts",
        $fetch
      )
      return {
        $listSessions,
        listSessions,
        $listUserAccounts,
        listUserAccounts
      }
    }
  } satisfies BetterAuthClientPlugin
}

export const authClient = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`,
  plugins: [organizationClient(), hooksPlugin()]
})
