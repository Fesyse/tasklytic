import type { SettingsTab } from "@/components/providers/settings-provider"
import { useStore } from "@nanostores/react"
import { atom } from "nanostores"

export type SettingsDialogStore = {
  open: boolean
  tab: SettingsTab
}

export const $settingsDialog = atom<SettingsDialogStore>({
  open: false,
  tab: "profile"
})

const setSettingsDialogTab = (tab: SettingsTab) => {
  return $settingsDialog.set({
    ...$settingsDialog.get(),
    tab
  })
}

const openSettingsDialog = (tab: SettingsTab = "profile") => {
  return $settingsDialog.set({
    open: true,
    tab
  })
}

const closeSettingsDialog = () => {
  return $settingsDialog.set({
    ...$settingsDialog.get(),
    open: false
  })
}

const toggleSettingsDialog = () => {
  const prev = $settingsDialog.get()

  return $settingsDialog.set({
    ...prev,
    open: !prev.open
  })
}

export const useSettingsDialog = () => {
  const { open, tab } = useStore($settingsDialog)

  return {
    open,
    tab,
    closeSettingsDialog,
    openSettingsDialog,
    setSettingsDialogTab,
    toggleSettingsDialog
  }
}
