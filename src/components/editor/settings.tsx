"use client"

import * as React from "react"

interface Model {
  label: string
  value: string
}

interface SettingsContextType {
  keys: Record<string, string>
  model: Model
  setKey: (service: string, key: string) => void
  setModel: (model: Model) => void
}

export const models: Model[] = [
  { label: "gpt-4o-mini", value: "gpt-4o-mini" },
  { label: "gpt-4o", value: "gpt-4o" },
  { label: "gpt-4-turbo", value: "gpt-4-turbo" },
  { label: "gpt-4", value: "gpt-4" },
  { label: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
  { label: "gpt-3.5-turbo-instruct", value: "gpt-3.5-turbo-instruct" }
]

const SettingsContext = React.createContext<SettingsContextType | undefined>(
  undefined
)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = React.useState({
    openai: "",
    uploadthing: ""
  })
  const [model, setModel] = React.useState<Model>(models[0]!)

  const setKey = (service: string, key: string) => {
    setKeys((prev) => ({ ...prev, [service]: key }))
  }

  return (
    <SettingsContext.Provider value={{ keys, model, setKey, setModel }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = React.useContext(SettingsContext)

  return (
    context ?? {
      keys: {
        openai: "",
        uploadthing: ""
      },
      model: models[0]!,
      setKey: () => {},
      setModel: () => {}
    }
  )
}
