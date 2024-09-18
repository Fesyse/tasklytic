"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
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
import { api } from "@/trpc/react"

export const CreateProject = () => {
  const utils = api.useUtils()
  const router = useRouter()
  const { mutate } = api.projects.create.useMutation({
    onError: error => toast.error(error.message)
  })

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema)
  })

  const createProject = (data: CreateProjectSchema) => {
    return mutate(data, {
      onSuccess: data => {
        const project = data[0]!
        void utils.projects.getAll.invalidate()
        router.push(`/project/${project.id}`)
        toast.success("Successfully created project!")
      }
    })
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
        <FormField
          name="icon"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon/logo</FormLabel>
              <FormControl>
                <FileUpload onChange={field.onChange} multiple={false} />
              </FormControl>
              <FormDescription>
                This is the icon/logo of your project.
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
