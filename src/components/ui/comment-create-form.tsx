"use client"

import * as React from "react"

import { withProps } from "@udecode/cn"
import { type Value, NodeApi } from "@udecode/plate"
import { AIPlugin } from "@udecode/plate-ai/react"
import {
  BasicMarksPlugin,
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin
} from "@udecode/plate-basic-marks/react"
import { getCommentKey, getDraftCommentKey } from "@udecode/plate-comments"
import { CommentsPlugin, useCommentId } from "@udecode/plate-comments/react"
import { DatePlugin } from "@udecode/plate-date/react"
import { EmojiInputPlugin } from "@udecode/plate-emoji/react"
import { LinkPlugin } from "@udecode/plate-link/react"
import { InlineEquationPlugin } from "@udecode/plate-math/react"
import { MentionInputPlugin, MentionPlugin } from "@udecode/plate-mention/react"
import {
  type CreatePlateEditorOptions,
  Plate,
  PlateLeaf,
  useEditorRef,
  usePluginOption
} from "@udecode/plate/react"
import { ArrowUpIcon } from "lucide-react"

import { discussionPlugin } from "@/components/editor/plugins/discussion-plugin"
import { useCreateEditor } from "@/components/editor/use-create-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useDiscussions } from "@/hooks/use-discussions"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { AILeaf } from "./ai-leaf"
import { DateElement } from "./date-element"
import { Editor, EditorContainer } from "./editor"
import { EmojiInputElement } from "./emoji-input-element"
import { InlineEquationElement } from "./inline-equation-element"
import { LinkElement } from "./link-element"
import { MentionElement } from "./mention-element"
import { MentionInputElement } from "./mention-input-element"

export const useCommentEditor = (
  options: Omit<CreatePlateEditorOptions, "plugins"> = {},
  deps: any[] = []
) => {
  const commentEditor = useCreateEditor(
    {
      id: "comment",
      components: {
        [AIPlugin.key]: AILeaf,
        [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
        [DatePlugin.key]: DateElement,
        [EmojiInputPlugin.key]: EmojiInputElement,
        [InlineEquationPlugin.key]: InlineEquationElement,
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
        [LinkPlugin.key]: LinkElement,
        [MentionInputPlugin.key]: MentionInputElement,
        [MentionPlugin.key]: MentionElement,
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" })
        // [SlashInputPlugin.key]: SlashInputElement,
      },
      placeholders: false,
      plugins: [BasicMarksPlugin],
      value: [],
      ...options
    },
    deps
  )

  return commentEditor
}

export function CommentCreateForm({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  focusOnMount = false
}: {
  autoFocus?: boolean
  className?: string
  discussionId?: string
  focusOnMount?: boolean
}) {
  const editor = useEditorRef()
  const commentId = useCommentId()
  const discussionId = discussionIdProp ?? commentId
  const noteId = usePluginOption(discussionPlugin, "noteId") || ""
  const { addComment, addDiscussion } = useDiscussions(noteId)

  const session = authClient.useSession()
  const userInfo = {
    id: session.data?.user.id || "",
    name: session.data?.user.name || "",
    avatarUrl: session.data?.user.image || ""
  }

  const [commentValue, setCommentValue] = React.useState<Value | undefined>()
  const commentContent = React.useMemo(
    () =>
      commentValue ? NodeApi.string({ children: commentValue, type: "p" }) : "",
    [commentValue]
  )
  const commentEditor = useCommentEditor({}, [])

  React.useEffect(() => {
    if (commentEditor && focusOnMount) {
      commentEditor.tf.focus()
    }
  }, [commentEditor, focusOnMount])

  const onAddComment = React.useCallback(async () => {
    if (!commentValue) return

    commentEditor.tf.reset()

    if (discussionId) {
      // Add comment to existing discussion
      await addComment(discussionId, commentValue)
      return
    }

    const commentsNodeEntry = editor
      .getApi(CommentsPlugin)
      .comment.nodes({ at: [], isDraft: true })

    if (commentsNodeEntry.length === 0) return

    const documentContent = commentsNodeEntry
      .map(([node]) => node.text)
      .join("")

    // Get the blockId from the first comment node entry
    const blockId = commentsNodeEntry[0][1][0].toString()

    // Create new discussion with first comment
    const newDiscussionId = await addDiscussion(
      blockId,
      documentContent,
      commentValue
    )

    if (!newDiscussionId) return

    const id = newDiscussionId

    commentsNodeEntry.forEach(([, path]) => {
      editor.tf.setNodes(
        {
          [getCommentKey(id)]: true
        },
        { at: path, split: true }
      )
      editor.tf.unsetNodes([getDraftCommentKey()], { at: path })
    })
  }, [
    commentValue,
    commentEditor.tf,
    discussionId,
    editor,
    addComment,
    addDiscussion
  ])

  return (
    <div className={cn("flex w-full", className)}>
      <div className="mt-2 mr-1 shrink-0">
        <Avatar className="size-5">
          <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
          <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="relative flex grow gap-2">
        <Plate
          onChange={({ value }) => {
            setCommentValue(value)
          }}
          editor={commentEditor}
        >
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="min-h-20 grow pt-0.5 pr-8"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onAddComment()
                }
              }}
              placeholder="Reply..."
              autoComplete="off"
              autoFocus={autoFocus}
            />

            <Button
              className="absolute top-1 right-1"
              variant="ghost"
              size="icon"
              disabled={!commentContent}
              onClick={() => {
                onAddComment()
              }}
            >
              <ArrowUpIcon className="size-4" />
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  )
}
