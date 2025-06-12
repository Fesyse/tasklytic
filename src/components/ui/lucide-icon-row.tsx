import { Button } from "@/components/ui/button"
import { icons } from "lucide-react"
import React, { Suspense } from "react"
import { type IconSelectorProps } from "./icon-selector"

const COLUMNS = 11

type LucideIconRowProps = {
  index: number
  style: React.CSSProperties
  data: {
    onSelect: IconSelectorProps["onSelect"]
    filteredIcons: string[]
    selectedIcon?: IconSelectorProps["selectedIcon"]
    setHoveredIcon: React.Dispatch<React.SetStateAction<string | null>>
  }
}

export function LucideIconRow({ index, style, data }: LucideIconRowProps) {
  const { onSelect, filteredIcons, selectedIcon, setHoveredIcon } = data
  const startIndex = index * COLUMNS
  const endIndex = Math.min(startIndex + COLUMNS, filteredIcons.length)
  const iconsInRow = filteredIcons.slice(startIndex, endIndex)

  return (
    <div
      style={{
        ...style,
        gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`
      }}
      className="grid gap-1"
    >
      {iconsInRow.map((iconName) => {
        const IconComponent = icons[iconName as keyof typeof icons] as any
        return (
          <Button
            key={iconName}
            variant={selectedIcon?.value === iconName ? "default" : "ghost"}
            size="sm"
            className="hover:bg-accent h-8 w-8 p-0"
            onClick={() => onSelect({ type: "lucide", value: iconName })}
            onMouseEnter={() => setHoveredIcon(iconName)}
            onMouseLeave={() => setHoveredIcon(null)}
            title={iconName}
          >
            <Suspense
              fallback={<div className="bg-muted h-8 animate-pulse rounded" />}
            >
              {IconComponent ? <IconComponent className="!size-6" /> : null}
            </Suspense>
          </Button>
        )
      })}
    </div>
  )
}
