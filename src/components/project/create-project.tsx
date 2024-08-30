"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type CreateProjectSchema, createProjectSchema } from "@/lib/schemas"
import { getProjectsFromLocalStorage } from "@/lib/utils"
import { type Project } from "@/server/db/schema"
import { api } from "@/trpc/react"

export const CreateProject = () => {
  const router = useRouter()
  const { mutate } = api.project.create.useMutation()
  const { data: session } = useSession()

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema)
  })

  const createProject = (data: CreateProjectSchema) => {
    const onSuccess = (project: Project) => {
      router.push(`/project/${project.id}`)
      toast.success("Successfully created project!")
    }

    if (session)
      return mutate(data, {
        onSuccess: data => {
          const project = data[0]!
          onSuccess(project)
        }
      })

    // if guest
    const project = createProjectWithLocalStorage(data)
    onSuccess(project)
  }

  const createProjectWithLocalStorage = (data: CreateProjectSchema) => {
    const projects = getProjectsFromLocalStorage()

    const id = `${
      projects[0]
        ? isNaN(parseInt(projects[0].id))
          ? 1
          : parseInt(projects[0].id)
        : 1
    }`
    const project: Project = {
      id,
      name: data.name,
      userId: "guest",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    projects.push(project)

    localStorage.setItem("projects", JSON.stringify(projects))
    return project
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(createProject)}
        className="flex flex-col gap-4"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Project Name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name of your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>Submit</Button>
      </form>
    </Form>
  )
}
