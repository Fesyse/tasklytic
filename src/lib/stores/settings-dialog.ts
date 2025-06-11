import type { SettingsTab } from "@/components/providers/settings-provider"
import { useStore } from "@nanostores/react"
import { atom } from "nanostores"
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs"
import { useEffect } from "react"

export type SettingsDialogStore = {
  open: boolean
  tab: SettingsTab
}

const SETTINGS_TABS = [
  "profile",
  "preferences",
  "security"
] as const satisfies SettingsTab[]

export const $settingsDialog = atom<SettingsDialogStore>({
  open: false,
  tab: "profile"
})

export const useSettingsDialog = () => {
  const { open, tab } = useStore($settingsDialog)

  const [dialogOpenFromSearchParams, setDialogOpenFromSearchParams] =
    useQueryState("dialogOpen", {
      ...parseAsBoolean,
      defaultValue: false,
      clearOnDefault: true
    })
  const [tabFromSearchParams, setTabFromSearchParams] = useQueryState("tab", {
    ...parseAsStringLiteral(SETTINGS_TABS),
    defaultValue: tab,
    clearOnDefault: true
  })

  const setSettingsDialogTab = (tab: SettingsTab) => {
    setTabFromSearchParams(tab)
    return $settingsDialog.set({
      ...$settingsDialog.get(),
      tab
    })
  }

  const openSettingsDialog = (tab?: SettingsTab) => {
    if (tab) setTabFromSearchParams(tab)
    setDialogOpenFromSearchParams(true)

    const store = $settingsDialog.get()
    return $settingsDialog.set({
      tab: tab ?? store.tab,
      open: true
    })
  }

  const closeSettingsDialog = () => {
    setDialogOpenFromSearchParams(false)
    return $settingsDialog.set({
      ...$settingsDialog.get(),
      open: false
    })
  }

  const toggleSettingsDialog = () => {
    const prev = $settingsDialog.get()
    setDialogOpenFromSearchParams(!prev.open)

    return $settingsDialog.set({
      ...prev,
      open: !prev.open
    })
  }

  useEffect(() => {
    if (tab === "profile" && tabFromSearchParams !== tab) {
      $settingsDialog.set({
        ...$settingsDialog.get(),
        tab: tabFromSearchParams
      })
    }
  }, [tabFromSearchParams])

  useEffect(() => {
    const store = $settingsDialog.get()
    if (store.open === dialogOpenFromSearchParams) return

    $settingsDialog.set({
      ...store,
      open: dialogOpenFromSearchParams
    })
  }, [dialogOpenFromSearchParams])

  console.log(tab, tabFromSearchParams)

  return {
    open,
    tab,
    closeSettingsDialog,
    openSettingsDialog,
    setSettingsDialogTab,
    toggleSettingsDialog
  }
}
