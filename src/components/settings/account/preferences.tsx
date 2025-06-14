"use client"

import { LANGUAGES } from "@/components/language-selector"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { setUserLocale } from "@/lib/server-actions/locale"
import { cn } from "@/lib/utils"
import { LanguagesIcon, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

export function SettingsAccountPreferences() {
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const t = useTranslations("Dashboard.Settings.tabs.accountGroup.preferences")
  const currentLocale = useLocale()

  const handleLanguageChange = async (newLocale: string) => {
    setIsChangingLanguage(true)
    try {
      await setUserLocale(newLocale)
    } finally {
      setIsChangingLanguage(false)
    }
  }

  return (
    <section>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium">{t("themeChange.title")}</h5>
            <p className="text-muted-foreground text-sm">
              {t("themeChange.description")}
            </p>
          </div>
          <ModeToggle className="border-xs w-auto rounded-md border" expanded />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium">{t("languageChooser.title")}</h5>
            <p className="text-muted-foreground text-sm">
              {t("languageChooser.description")}
            </p>
          </div>
          <Select
            onValueChange={(value) => handleLanguageChange(value)}
            defaultValue={currentLocale}
          >
            <SelectTrigger
              className={cn("w-38 justify-start [&>svg]:last:ml-auto", {
                "[&>svg]:last:hidden": isChangingLanguage
              })}
            >
              <LanguagesIcon />
              <SelectValue
                className="self-start"
                placeholder={t("languageChooser.placeholder")}
              />
              {isChangingLanguage ? (
                <Loader2 className="ml-auto size-4 animate-spin" />
              ) : null}
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
}
