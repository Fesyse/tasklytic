"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { type FileUploadResponse } from "@/app/api/file-upload/route"
import { type CreateProjectSchema, createProjectSchema } from "@/lib/schemas"
import { api } from "@/trpc/react"

export const CreateProject = () => {
  const utils = api.useUtils()
  const router = useRouter()
  const { mutate } = api.projects.create.useMutation({
    onError: error => toast.error(error.message),
    onSuccess: async data => {
      const project = data!

      router.push(`/projects/${project.id}`)
      toast.success("Successfully created project!")
      await utils.projects.getAll.invalidate()
    }
  })

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema)
  })

  const createProject = async (data: CreateProjectSchema) => {
    let icon = undefined

    if (data.icon) {
      const formData = new FormData()
      formData.append("file", data.icon)

      const { file } = (await fetch("/api/file-upload", {
        method: "POST",
        headers: {},
        body: formData
      }).then(res => res.json())) as FileUploadResponse

      icon = file
    }

    const project = { ...data, icon }
    mutate(project)
  }

  const formValues = form.watch()

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
          name="checkIcon"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Add icon</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        {formValues.checkIcon ? (
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
        ) : null}
        <Button>Submit</Button>
      </form>
    </Form>
  )
}
