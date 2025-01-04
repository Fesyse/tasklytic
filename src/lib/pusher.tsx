import { useParams } from "next/navigation"
import type { Channel, PresenceChannel } from "pusher-js"
import Pusher from "pusher-js"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { createStore, useStore } from "zustand"
import { getNoteSlug } from "./pusher-slugs"
import { env } from "@/env"

type PusherProps = {
  slug: string
}

type PusherState = {
  pusherClient: Pusher
  channel: Channel
  presenceChannel: PresenceChannel
  members: Map<string, unknown>
}

const createPusherStore = ({ slug }: PusherProps) => {
  let pusherClient: Pusher
  if (Pusher.instances.length) {
    pusherClient = Pusher.instances[0] as Pusher
    pusherClient.connect()
  } else {
    pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth-channel"
    })
  }

  const channel = pusherClient.subscribe(slug)

  const presenceChannel = pusherClient.subscribe(
    `presence-${slug}`
  ) as PresenceChannel

  const store = createStore<PusherState>(() => {
    return {
      pusherClient,
      channel,
      presenceChannel,
      members: new Map()
    }
  })

  // Update helper that sets 'members' to contents of presence channel's current members
  const updateMembers = () => {
    store.setState(() => ({
      members: new Map(Object.entries(presenceChannel.members.members))
    }))
  }

  // Bind all "present users changed" events to trigger updateMembers
  presenceChannel.bind("pusher:subscription_succeeded", updateMembers)
  presenceChannel.bind("pusher:member_added", updateMembers)
  presenceChannel.bind("pusher:member_removed", updateMembers)

  return store
}

/**
 * Section 2: "The Context Provider"
 *
 */
type PusherStore = ReturnType<typeof createPusherStore>
export const PusherContext = createContext<PusherStore | null>(null)

/**
 * This provider is the thing you mount in the app to "give access to Pusher"
 */
type PusherProviderProps = React.PropsWithChildren<PusherProps>

export const PusherProvider = ({ slug, children }: PusherProviderProps) => {
  const [store, setStore] = useState<PusherStore>()

  useEffect(() => {
    const newStore = createPusherStore({ slug })
    setStore(newStore)

    return () => {
      const pusher = newStore.getState().pusherClient
      console.log("disconnecting pusher:", pusher)
      console.log(
        "(Expect a warning in terminal after this, React Dev Mode and all)"
      )
      pusher.disconnect()
    }
  }, [])

  if (!store) return children

  return (
    <PusherContext.Provider value={store}>{children}</PusherContext.Provider>
  )
}

/**
 * Section 3: "The Hooks"
 *
 * The exported hooks you use to interact with this store (in this case just an event sub)
 */
function usePusherStore<T>(
  selector: (state: PusherState) => T,
  throwOnUndefined: boolean = true,
  equalityFn?: (left: T, right: T) => boolean
): typeof throwOnUndefined extends true ? T : T | undefined {
  const store = useContext(PusherContext)
  if (!store) {
    if (throwOnUndefined)
      throw new Error("Missing PusherContext.Provider in the tree")
    else return
  }

  return useStore(store, selector, equalityFn)
}

export function useSubscribeToEvent<MessageType>(
  eventName: string,
  callback: (data: MessageType) => void
) {
  const channel = usePusherStore(state => state.channel, false)

  const stableCallback = useRef(callback)

  // Keep callback sync'd
  useEffect(() => {
    stableCallback.current = callback
  }, [callback])

  useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data)
    }
    if (!channel) return

    channel.bind(eventName, reference as any)
    return () => {
      channel.unbind(eventName, reference)
    }
  }, [channel, eventName])
}

export const useCurrentMemberCount = () => usePusherStore(s => s.members.size)

// Slugs

export const useNoteSlug = () => {
  const { projectId, noteId } = useParams<{
    projectId: string
    noteId: string
  }>()
  return getNoteSlug(projectId, noteId)
}
