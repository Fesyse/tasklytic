import { CreateProject } from "@/components/project/create-project"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

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