/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: false,
  trailingComma: "none",
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  arrowParens: "avoid",
  importOrder: [
    "server-only",
    "<THIRD_PARTY_MODULES>",
    "^@/types/(.*)$",
    "^@/api/(.*)$",
    "^@/constants/(.*)$",
    "^@/utils/(.*)$",
    "^@/assets/(.*)$",
    "^@/config/(.*)$",
    "^@/store/(.*)$",
    "^@/hooks/(.*)$",
    "^@/providers/(.*)$",
    "^@/components/(.*)$",
    "^@/layout/(.*)$",
    "^@/ui/(.*)$",
    "(.scss)$",
    "^../(.*)",
    "^./(.*)"
  ],
  importOrderSortSpecifiers: true,
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports"
  ]
}

export default config
