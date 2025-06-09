"use client"

import * as React from "react"

import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import type { TTableElement } from "@udecode/plate-table"

import { PopoverAnchor } from "@radix-ui/react-popover"
import { BlockSelectionPlugin } from "@udecode/plate-selection/react"
import { setCellBackground } from "@udecode/plate-table"
import {
  TablePlugin,
  TableProvider,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableMergeState
} from "@udecode/plate-table/react"
import {
  type PlateElementProps,
  PlateElement,
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  usePluginOption,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
  withHOC
} from "@udecode/plate/react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CombineIcon,
  EraserIcon,
  Grid2X2Icon,
  PaintBucketIcon,
  SquareSplitHorizontalIcon,
  Trash2Icon,
  XIcon
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { useTranslations } from "next-intl"
import { DEFAULT_COLORS } from "./color-constants"
import { ColorDropdownMenuItems } from "./color-dropdown-menu-items"
import {
  BorderAll,
  BorderBottom,
  BorderLeft,
  BorderNone,
  BorderRight,
  BorderTop
} from "./table-icons"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarMenuGroup
} from "./toolbar"

export const TableElement = withHOC(
  TableProvider,
  function TableElement({
    children,
    ...props
  }: PlateElementProps<TTableElement>) {
    const readOnly = useReadOnly()
    const isSelectionAreaVisible = usePluginOption(
      BlockSelectionPlugin,
      "isSelectionAreaVisible"
    )
    const hasControls = !readOnly && !isSelectionAreaVisible
    const selected = useSelected()
    const { isSelectingCell, marginLeft, props: tableProps } = useTableElement()

    const content = (
      <PlateElement
        {...props}
        className={cn(
          "overflow-x-auto py-5",
          hasControls && "-ml-2 *:data-[slot=block-selection]:left-2"
        )}
        style={{ paddingLeft: marginLeft }}
      >
        <div className="group/table relative w-fit">
          <table
            className={cn(
              "mr-0 ml-px table h-px table-fixed border-collapse",
              isSelectingCell && "selection:bg-transparent"
            )}
            {...tableProps}
          >
            <tbody className="min-w-full">{children}</tbody>
          </table>
        </div>
      </PlateElement>
    )

    if (readOnly || !selected) {
      return content
    }

    return <TableFloatingToolbar>{content}</TableFloatingToolbar>
  }
)

export function TableFloatingToolbar({
  children,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.TableElement.Tooltips"
  )
  const { tf } = useEditorPlugin(TablePlugin)
  const element = useElement<TTableElement>()
  const { props: buttonProps } = useRemoveNodeButton({ element })
  const collapsed = useEditorSelector((editor) => !editor.api.isExpanded(), [])

  const { canMerge, canSplit } = useTableMergeState()

  return (
    <Popover open={canMerge || canSplit || collapsed} modal={false}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        asChild
        onOpenAutoFocus={(e) => e.preventDefault()}
        contentEditable={false}
        {...props}
      >
        <Toolbar
          className="scrollbar-hide bg-popover flex w-auto max-w-[80vw] flex-row overflow-x-auto rounded-md border p-1 shadow-md print:hidden"
          contentEditable={false}
        >
          <ToolbarGroup>
            <ColorDropdownMenu tooltip={t("backgroundColor")}>
              <PaintBucketIcon />
            </ColorDropdownMenu>
            {canMerge && (
              <ToolbarButton
                onClick={() => tf.table.merge()}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("mergeCells")}
              >
                <CombineIcon />
              </ToolbarButton>
            )}
            {canSplit && (
              <ToolbarButton
                onClick={() => tf.table.split()}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("splitCells")}
              >
                <SquareSplitHorizontalIcon />
              </ToolbarButton>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <ToolbarButton tooltip={t("cellBorders")}>
                  <Grid2X2Icon />
                </ToolbarButton>
              </DropdownMenuTrigger>

              <DropdownMenuPortal>
                <TableBordersDropdownMenuContent />
              </DropdownMenuPortal>
            </DropdownMenu>

            {collapsed && (
              <ToolbarGroup>
                <ToolbarButton tooltip={t("deleteTable")} {...buttonProps}>
                  <Trash2Icon />
                </ToolbarButton>
              </ToolbarGroup>
            )}
          </ToolbarGroup>

          {collapsed && (
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableRow({ before: true })
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("insertRowBefore")}
              >
                <ArrowUp />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableRow()
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("insertRowAfter")}
              >
                <ArrowDown />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.remove.tableRow()
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("deleteRow")}
              >
                <XIcon />
              </ToolbarButton>
            </ToolbarGroup>
          )}

          {collapsed && (
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableColumn({ before: true })
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("insertColumnBefore")}
              >
                <ArrowLeft />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.insert.tableColumn()
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("insertColumnAfter")}
              >
                <ArrowRight />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  tf.remove.tableColumn()
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip={t("deleteColumn")}
              >
                <XIcon />
              </ToolbarButton>
            </ToolbarGroup>
          )}
        </Toolbar>
      </PopoverContent>
    </Popover>
  )
}

export function TableBordersDropdownMenuContent(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Content>
) {
  const t = useTranslations(
    "Dashboard.Note.Editor.Elements.TableElement.BorderButtons"
  )
  const editor = useEditorRef()
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder
  } = useTableBordersDropdownMenuContentState()

  return (
    <DropdownMenuContent
      className="min-w-[220px]"
      onCloseAutoFocus={(e) => {
        e.preventDefault()
        editor.tf.focus()
      }}
      align="start"
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasTopBorder}
          onCheckedChange={getOnSelectTableBorder("top")}
        >
          <BorderTop />
          <div>{t("topBorder")}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasRightBorder}
          onCheckedChange={getOnSelectTableBorder("right")}
        >
          <BorderRight />
          <div>{t("rightBorder")}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasBottomBorder}
          onCheckedChange={getOnSelectTableBorder("bottom")}
        >
          <BorderBottom />
          <div>{t("bottomBorder")}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasLeftBorder}
          onCheckedChange={getOnSelectTableBorder("left")}
        >
          <BorderLeft />
          <div>{t("leftBorder")}</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasNoBorders}
          onCheckedChange={getOnSelectTableBorder("none")}
        >
          <BorderNone />
          <div>{t("noBorder")}</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasOuterBorders}
          onCheckedChange={getOnSelectTableBorder("outer")}
        >
          <BorderAll />
          <div>{t("allBorders")}</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}

type ColorDropdownMenuProps = {
  children: React.ReactNode
  tooltip: string
}

function ColorDropdownMenu({ children, tooltip }: ColorDropdownMenuProps) {
  const t = useTranslations("Dashboard.Note.Editor.Elements.TableElement")
  const [open, setOpen] = React.useState(false)

  const editor = useEditorRef()
  const selectedCells = usePluginOption(TablePlugin, "selectedCells")

  const onUpdateColor = React.useCallback(
    (color: string) => {
      setOpen(false)
      setCellBackground(editor, { color, selectedCells: selectedCells ?? [] })
    },
    [selectedCells, editor]
  )

  const onClearColor = React.useCallback(() => {
    setOpen(false)
    setCellBackground(editor, {
      color: null,
      selectedCells: selectedCells ?? []
    })
  }, [selectedCells, editor])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip}>{children}</ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ToolbarMenuGroup label={t("colorsLabel")}>
          <ColorDropdownMenuItems
            className="px-2"
            colors={DEFAULT_COLORS}
            updateColor={onUpdateColor}
          />
        </ToolbarMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2" onClick={onClearColor}>
            <EraserIcon />
            <span>{t("clearColor")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
