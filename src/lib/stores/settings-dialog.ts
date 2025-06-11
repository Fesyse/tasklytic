import type { SettingsTab } from "@/components/providers/settings-provider"
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
  const [dialogOpenFromSearchParams, setDialogOpenFromSearchParams] =
    useQueryState("dialogOpen", {
      ...parseAsBoolean,
      defaultValue: false,
      clearOnDefault: true
    })
  const [tabFromSearchParams, setTabFromSearchParams] = useQueryState("tab", {
    ...parseAsStringLiteral(SETTINGS_TABS),
    defaultValue: "profile",
    clearOnDefault: true
  })

  // Synchronize the nanostores atom with the query state
  useEffect(() => {
    $settingsDialog.set({
      open: dialogOpenFromSearchParams,
      tab: tabFromSearchParams
    })
  }, [dialogOpenFromSearchParams, tabFromSearchParams])

  const setSettingsDialogTab = (tab: SettingsTab) => {
    setTabFromSearchParams(tab)
  }

  const openSettingsDialog = (tab?: SettingsTab) => {
    if (tab) setTabFromSearchParams(tab)
    setDialogOpenFromSearchParams(true)
  }

  const closeSettingsDialog = () => {
    setDialogOpenFromSearchParams(false)
  }

  const toggleSettingsDialog = () => {
    setDialogOpenFromSearchParams(!dialogOpenFromSearchParams)
  }

  return {
    open: dialogOpenFromSearchParams,
    tab: tabFromSearchParams,
    closeSettingsDialog,
    openSettingsDialog,
    setSettingsDialogTab,
    toggleSettingsDialog
  }
}
