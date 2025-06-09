"use client"

import type { TComment } from "@/components/ui/comment"

import { createPlatePlugin } from "@udecode/plate/react"

import { BlockDiscussion } from "@/components/ui/block-discussion"

export interface TDiscussion {
  id: string
  comments: TComment[]
  createdAt: Date
  isResolved: boolean
  userId: string
  documentContent?: string
}

// This plugin is purely UI. It's only used to store the discussions and users data
export const discussionPlugin = createPlatePlugin({
  key: "discussion"
}).configure({
  render: { aboveNodes: BlockDiscussion }
})
