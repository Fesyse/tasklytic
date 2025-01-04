import { Calendar, FileIcon, Lock, Pin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { type Note } from "@/server/db/schema"

export function NoteCard({ note }: { note: Note }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          {note.emoji ? (
            <span className="text-xl">{note.emoji}</span>
          ) : (
            <FileIcon size={20} />
          )}
          {note.title}
        </CardTitle>
        <div className="flex space-x-1">
          {note.private ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : null}
          {note.isPinned ? (
            <Pin className="h-4 w-4 text-muted-foreground" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Last updated: {note.updatedAt?.toLocaleDateString() || "N/A"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant="secondary">Project: {note.projectId}</Badge>
        <Button variant="ghost" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          {note.createdAt?.toLocaleDateString() || "N/A"}
        </Button>
      </CardFooter>
    </Card>
  )
}
