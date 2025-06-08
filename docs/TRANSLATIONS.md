# Translation Process Documentation

This document outlines the translation process for the application, leveraging the `next-intl` library. All translation files are stored in the `messages/` directory at the root of the project.

## Translation File Structure

Translation files are JSON files named after their respective locales (e.g., `en.json`, `ru.json`). These files contain a nested object structure that mirrors the component hierarchy or logical grouping of translatable strings.

For example, the translations for the `TurnIntoDropdownMenu` component are located under the following path within the JSON files:

```json
{
  "Dashboard": {
    "Note": {
      "Editor": {
        "Elements": {
          "TurnIntoDropdownMenu": {
            "turnInto": "Turn into",
            "items": {
              "text": "Text",
              "heading1": "Heading 1",
              "heading2": "Heading 2",
              "heading3": "Heading 3",
              "bulletedList": "Bulleted list",
              "numberedList": "Numbered list",
              "todoList": "To-do list",
              "toggleList": "Toggle list",
              "code": "Code",
              "quote": "Quote",
              "threeColumns": "3 columns"
            }
          }
        }
      }
    }
  }
}
```

## Adding New Translations

To add new translatable strings:

1.  **Identify the string:** Determine the text string in a component that needs to be translated.
2.  **Choose a logical key path:** Based on the component's location and function, decide on a suitable nested key path within the `messages/*.json` files. Follow the existing structure (e.g., `Dashboard.Note.Editor.Elements.ComponentName.keyName`).
3.  **Add the key to JSON files:** Open `messages/en.json` (and `messages/ru.json` or any other locale files) and add the new key-value pair to the chosen path. Ensure consistency across all locale files.

    _Example for `en.json`:_ `"newKey": "New English text"`
    _Example for `ru.json`:_ `"newKey": "Новый русский текст"`

4.  **Update `next-intl` configuration (if necessary):** If you introduce a completely new top-level namespace or a significantly different structure, you might need to update your `next-intl` configuration file (e.g., `i18n.ts` or `next-intl.config.ts`) to inform `next-intl` about the new available namespaces. This usually involves modifying the `Pathnames` or `LocaleConfig` type definitions.

## Using `useTranslations` Hook

In your React components, use the `useTranslations` hook from `next-intl` to access translated strings.

1.  **Import the hook:**

    ```typescript
    import { useTranslations } from "next-intl"
    ```

2.  **Instantiate the hook:** Call `useTranslations` with the base path to your desired translation keys. This makes all keys under that path accessible directly.

    ```typescript
    const t = useTranslations(
      "Dashboard.Note.Editor.Elements.TurnIntoDropdownMenu"
    )
    ```

3.  **Use translated strings:** Access the translated strings using the `t()` function, providing the relative key.

    ```typescript
    <ToolbarButton tooltip={t("turnInto")}>
      {selectedItem.label}
    </ToolbarButton>

    // For nested items within the chosen base path
    label: t("items.text"),
    ```

This approach ensures that all translatable strings are centrally managed and easily accessible within your components.
