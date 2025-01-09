import { Calendar, FileIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteCardActions } from "./note-card-actions"
import { type Note } from "@/server/db/schema"

export function NoteCard({ note }: { note: Note }) {
  return (
    <Link href={`/projects/${note.projectId}/note/${note.id}`} prefetch>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            {note.emoji ? (
              <span className="text-xl">{note.emoji}</span>
            ) : (
              <FileIcon size={20} />
            )}
            {note.title}
          </CardTitle>
          <NoteCardActions note={note} />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Last updated: {note.updatedAt?.toLocaleDateString() || "N/A"}
          </p>
        </CardContent>
        <CardFooter className="flex sm:justify-between sm:flex-row flex-col">
          <Badge variant="secondary">
            Project:
            <span className="ml-1 truncate max-w-16 whitespace-nowrap">
              {note.projectId}
            </span>
          </Badge>
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {note.createdAt?.toLocaleDateString() || "N/A"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}

export function NoteCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </CardFooter>
    </Card>
  )
}
