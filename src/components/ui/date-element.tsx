"use client"

import type { TDateElement } from "@udecode/plate-date"
import type { PlateElementProps } from "@udecode/plate/react"

import { PlateElement, useReadOnly } from "@udecode/plate/react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"

export function DateElement(props: PlateElementProps<TDateElement>) {
  const locale = useLocale()
  const t = useTranslations("Dashboard.Note.Editor.Elements.DateElement")
  const { editor, element } = props

  const readOnly = useReadOnly()

  const trigger = (
    <span
      className={cn(
        "bg-muted text-muted-foreground w-fit cursor-pointer rounded-sm px-1"
      )}
      contentEditable={false}
      draggable
    >
      {element.date ? (
        (() => {
          const today = new Date()
          const elementDate = new Date(element.date)
          const isToday =
            elementDate.getDate() === today.getDate() &&
            elementDate.getMonth() === today.getMonth() &&
            elementDate.getFullYear() === today.getFullYear()

          const isYesterday =
            new Date(today.setDate(today.getDate() - 1)).toDateString() ===
            elementDate.toDateString()
          const isTomorrow =
            new Date(today.setDate(today.getDate() + 2)).toDateString() ===
            elementDate.toDateString()

          if (isToday) return t("today")
          if (isYesterday) return t("yesterday")
          if (isTomorrow) return t("tomorrow")

          return elementDate.toLocaleDateString(
            `${locale}-${locale.toUpperCase()}`,
            {
              day: "numeric",
              month: "long",
              year: "numeric"
            }
          )
        })()
      ) : (
        <span>Pick a date</span>
      )}
    </span>
  )

  if (readOnly) {
    return trigger
  }

  return (
    <PlateElement
      {...props}
      className="inline-block"
      attributes={{
        ...props.attributes,
        contentEditable: false
      }}
    >
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            selected={new Date(element.date as string)}
            onSelect={(date) => {
              if (!date) return

              editor.tf.setNodes({ date: date.toDateString() }, { at: element })
            }}
            mode="single"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {props.children}
    </PlateElement>
  )
}
