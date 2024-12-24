import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { CreateProject } from "@/components/projects/create-project"

export default function CreateProjectPage() {
  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>Create new project</CardTitle>
          <CardDescription>
            Workspace where you can manage your tasks with ease.
          </CardDescription>
        </CardHeader>
        <CreateProject />
      </CardContent>
    </Card>
  )
}
