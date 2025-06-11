import { atom } from "nanostores"
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs"
import { useEffect } from "react"

export const SETTINGS_TABS = [
  "account-profile",
  "account-preferences",
  "account-security",
  "organization-general",
  "organization-members",
  "organization-security"
] as const

export type SettingsTab = (typeof SETTINGS_TABS)[number]

export type SettingsDialogStore = {
  open: boolean
  tab: SettingsTab
}

const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0]

export const $settingsDialog = atom<SettingsDialogStore>({
  open: false,
  tab: DEFAULT_SETTINGS_TAB
})

export const useSettingsDialog = () => {
  const [dialogOpenFromSearchParams, setDialogOpenFromSearchParams] =
    useQueryState("settingsDialogOpen", {
      ...parseAsBoolean,
      defaultValue: false,
      clearOnDefault: true
    })
  const [tabFromSearchParams, setTabFromSearchParams] = useQueryState(
    "settingsTab",
    {
      ...parseAsStringLiteral(SETTINGS_TABS),
      defaultValue: DEFAULT_SETTINGS_TAB,
      clearOnDefault: true
    }
  )

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
