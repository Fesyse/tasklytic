"use client"

import * as React from "react"

import type { Value } from "@udecode/plate"

import { CommentsPlugin } from "@udecode/plate-comments/react"
import { Plate, useEditorPlugin } from "@udecode/plate/react"
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format
} from "date-fns"
import {
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ru, type Locale } from "date-fns/locale"

import { authClient } from "@/lib/auth-client"
import { useLocale, useTranslations } from "next-intl"
import { useCommentEditor } from "./comment-create-form"
import { Editor, EditorContainer } from "./editor"

const FormatCommentDateLocales: Record<string, Locale> = {
  ru: ru
}

export const formatCommentDate = (date: Date, locale: string) => {
  const now = new Date()
  const diffMinutes = differenceInMinutes(now, date)
  const diffHours = differenceInHours(now, date)
  const diffDays = differenceInDays(now, date)

  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }
  if (diffHours < 24) {
    return `${diffHours}h`
  }
  if (diffDays < 2) {
    return `${diffDays}d`
  }

  return format(date, "MM/dd/yyyy", {
    locale: FormatCommentDateLocales[locale]
  })
}

export interface TComment {
  id: string
  contentRich: Value
  createdAt: Date
  discussionId: string
  isEdited: boolean
  userId: string
  userImage?: string
}

export function Comment(props: {
  comment: TComment
  discussionLength: number
  editingId: string | null
  index: number
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>
  documentContent?: string
  showDocumentContent?: boolean
  onEditorClick?: () => void
  onUpdateComment?: (id: string, contentRich: Value) => Promise<void>
  onResolveDiscussion?: (id: string) => Promise<void>
  onRemoveComment?: (id: string) => Promise<void>
  onRemoveDiscussion?: (id: string) => Promise<void>
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
    onUpdateComment,
    onResolveDiscussion,
    onRemoveComment,
    onRemoveDiscussion
  } = props

  const session = authClient.useSession()
  const currentUserId = session.data?.user.id || ""
  const currentUserName = session.data?.user.name || ""

  // Get user info from auth
  const userInfo = {
    id: comment.userId,
    name: comment.userId === currentUserId ? currentUserName : comment.userId,
    avatarUrl: comment.userImage
  }

  const resolveDiscussion = async (id: string) => {
    if (onResolveDiscussion) {
      await onResolveDiscussion(id)
    }
  }

  const removeDiscussion = async (id: string) => {
    if (onRemoveDiscussion) {
      await onRemoveDiscussion(id)
    }
  }

  const updateComment = async (input: {
    id: string
    contentRich: Value
    discussionId: string
    isEdited: boolean
  }) => {
    if (onUpdateComment) {
      await onUpdateComment(input.id, input.contentRich)
    }
  }

  const locale = useLocale()
  const { tf } = useEditorPlugin(CommentsPlugin)

  // Check if comment belongs to current user
  const isMyComment = currentUserId === comment.userId

  const initialValue = comment.contentRich

  const commentEditor = useCommentEditor(
    {
      id: comment.id,
      value: initialValue
    },
    [initialValue]
  )

  const onCancel = () => {
    setEditingId(null)
    commentEditor.tf.replaceNodes(initialValue, {
      at: [],
      children: true
    })
  }

  const onSave = () => {
    void updateComment({
      id: comment.id,
      contentRich: commentEditor.children,
      discussionId: comment.discussionId,
      isEdited: true
    })
    setEditingId(null)
  }

  const onResolveComment = () => {
    void resolveDiscussion(comment.discussionId)
    tf.comment.unsetMark({ id: comment.discussionId })
  }

  const isFirst = index === 0
  const isLast = index === discussionLength - 1
  const isEditing = editingId && editingId === comment.id

  const [hovering, setHovering] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative flex items-center">
        <Avatar className="h-8 w-8 rounded-lg grayscale">
          <AvatarImage src={userInfo?.avatarUrl} alt={userInfo?.name} />
          <AvatarFallback className="rounded-lg">
            {userInfo?.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h4 className="mx-2 text-sm leading-none font-semibold">
          {userInfo?.name}
        </h4>

        <div className="text-muted-foreground/80 text-xs leading-none">
          <span className="mr-1">
            {formatCommentDate(new Date(comment.createdAt), locale)}
          </span>
          {comment.isEdited && <span>(edited)</span>}
        </div>

        {isMyComment && (hovering || dropdownOpen) && (
          <div className="absolute top-0 right-0 flex space-x-1">
            {index === 0 && (
              <Button
                size="smallIcon"
                variant="ghost"
                className="text-muted-foreground"
                onClick={onResolveComment}
                type="button"
              >
                <CheckIcon className="size-4" />
              </Button>
            )}

            <CommentMoreDropdown
              onCloseAutoFocus={() => {
                setTimeout(() => {
                  commentEditor.tf.focus({ edge: "endEditor" })
                }, 0)
              }}
              onRemoveComment={() => {
                if (discussionLength === 1) {
                  tf.comment.unsetMark({ id: comment.discussionId })
                  void removeDiscussion(comment.discussionId)
                } else if (onRemoveComment) {
                  void onRemoveComment(comment.id)
                }
              }}
              comment={comment}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              setEditingId={setEditingId}
            />
          </div>
        )}
      </div>

      {isFirst && showDocumentContent && (
        <div className="text-subtle-foreground relative mt-1 flex pl-[32px] text-sm">
          {discussionLength > 1 && (
            <div className="bg-muted absolute top-[5px] left-3 h-full w-0.5 shrink-0" />
          )}
          <div className="bg-highlight my-px w-0.5 shrink-0" />
          {documentContent && <div className="ml-2">{documentContent}</div>}
        </div>
      )}

      <div className="relative my-1 pl-[26px]">
        {!isLast && (
          <div className="bg-muted absolute top-0 left-3 h-full w-0.5 shrink-0" />
        )}
        <Plate readOnly={!isEditing} editor={commentEditor}>
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="w-auto grow"
              onClick={() => onEditorClick?.()}
            />

            {isEditing && (
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-[28px]"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    void onCancel()
                  }}
                >
                  <div className="bg-primary/40 flex size-5 shrink-0 items-center justify-center rounded-[50%]">
                    <XIcon className="text-background size-3 stroke-[3px]" />
                  </div>
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    void onSave()
                  }}
                >
                  <div className="bg-brand flex size-5 shrink-0 items-center justify-center rounded-[50%]">
                    <CheckIcon className="text-background size-3 stroke-[3px]" />
                  </div>
                </Button>
              </div>
            )}
          </EditorContainer>
        </Plate>
      </div>
    </div>
  )
}
interface CommentMoreDropdownProps {
  comment: TComment
  dropdownOpen: boolean
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>
  onCloseAutoFocus?: () => void
  onRemoveComment?: () => void
}

export function CommentMoreDropdown(props: CommentMoreDropdownProps) {
  const {
    comment,
    dropdownOpen,
    setDropdownOpen,
    setEditingId,
    onCloseAutoFocus,
    onRemoveComment
  } = props

  const t = useTranslations("Dashboard.Note.Editor.Elements.CommentElement")
  const selectedEditCommentRef = React.useRef<boolean>(false)

  const onDeleteComment = React.useCallback(() => {
    if (!comment.id)
      return alert("You are operating too quickly, please try again later.")

    onRemoveComment?.()
  }, [comment.id, onRemoveComment])

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true

    if (!comment.id)
      return alert("You are operating too quickly, please try again later.")

    setEditingId(comment.id)
  }, [comment.id, setEditingId])

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          size="smallIcon"
          variant="ghost"
          className={cn("text-muted-foreground")}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        onCloseAutoFocus={(e) => {
          if (selectedEditCommentRef.current) {
            onCloseAutoFocus?.()
            selectedEditCommentRef.current = false
          }

          return e.preventDefault()
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <PencilIcon className="size-4" />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <TrashIcon className="size-4" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
