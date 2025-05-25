import { atom } from "nanostores"

// Create individual atoms for each piece of state
export const $isSaving = atom<boolean>(false)
export const $isAutoSaving = atom<boolean>(false)
export const $isChanged = atom<boolean>(false)

// Helper functions to update the state
export function setIsSaving(value: boolean) {
  $isSaving.set(value)
}

export function setIsAutoSaving(value: boolean) {
  $isAutoSaving.set(value)
}

export function setIsChanged(value: boolean) {
  $isChanged.set(value)
}
