import type { TailwindConfig } from "@react-email/components"

export const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      borderRadius: {
        sm: "0px",
        md: "2px",
        lg: "4px",
        xl: "8px"
      },
      colors: {
        background: "oklch(0.22 0 0)",
        foreground: "oklch(0.89 0 0)",
        card: "oklch(0.24 0 0)",
        "card-foreground": "oklch(0.89 0 0)",
        popover: "oklch(0.24 0 0)",
        "popover-foreground": "oklch(0.89 0 0)",
        primary: "oklch(0.71 0 0)",
        "primary-foreground": "oklch(0.22 0 0)",
        secondary: "oklch(0.31 0 0)",
        "secondary-foreground": "oklch(0.89 0 0)",
        muted: "oklch(0.29 0 0)",
        "muted-foreground": "oklch(0.6 0 0)",
        accent: "oklch(0.37 0 0)",
        "accent-foreground": "oklch(0.89 0 0)",
        destructive: "oklch(0.66 0.15 22.17)",
        border: "oklch(0.33 0 0)",
        input: "oklch(0.31 0 0)",
        ring: "oklch(0.71 0 0)",
        "chart-1": "oklch(0.71 0 0)",
        "chart-2": "oklch(0.67 0.03 206.35)",
        "chart-3": "oklch(0.55 0 0)",
        "chart-4": "oklch(0.46 0 0)",
        "chart-5": "oklch(0.37 0 0)",
        sidebar: "oklch(0.24 0 0)",
        "sidebar-foreground": "oklch(0.89 0 0)",
        "sidebar-primary": "oklch(0.71 0 0)",
        "sidebar-primary-foreground": "oklch(0.22 0 0)",
        "sidebar-accent": "oklch(0.37 0 0)",
        "sidebar-accent-foreground": "oklch(0.89 0 0)",
        "sidebar-border": "oklch(0.33 0 0)",
        "sidebar-ring": "oklch(0.71 0 0)"
      }
    }
  }
}
