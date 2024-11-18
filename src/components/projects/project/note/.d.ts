import { BaseEditor } from "slate"
import { ReactEditor } from "slate-react"
import { type Block, type BLOCK_TYPE } from "../../../../server/db/schema"

export type ElementType = (typeof BLOCK_TYPE)[number]

type CustomElement = { type: ElementType; block: Block }
type CustomText = { text: string }

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}
