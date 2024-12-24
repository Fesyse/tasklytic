"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import Image from "next/image"
import { type FC } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { type UpdateProjectSchema, updateProjectSchema } from "@/lib/schemas"
import { type Project } from "@/server/db/schema"
import { api } from "@/trpc/react"

type UpdateProjectFormProps = {
  project: Project
}

export const UpdateProjectForm: FC<UpdateProjectFormProps> = ({ project }) => {
  const form = useForm<UpdateProjectSchema>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...project,
      icon: null
    }
  })
  const utils = api.useUtils()
  const { mutate: updateProject } = api.projects.update.useMutation({
    onError: error => toast.error(error.message),
    onSuccess: async () => {
      toast.success("Successfully updated project!")
      await utils.projects.getAll.invalidate()
    }
  })

  const onSubmit = async (data: UpdateProjectSchema) => {
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

    if (!data.name && !data.icon)
      return toast.success("Successfully updated project!")

    updateProject({
      id: project.id,
      ...data,
      icon:
        data.icon === "DELETE"
          ? undefined
          : icon
            ? { update: true, url: icon }
            : { delete: true }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="icon"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div>
                <Image
                  src=""
                  alt="Icon"
                  width={280}
                  height={100}
                  className="mx-auto rounded border-border"
                />
                <button onClick={() => field.onChange("DELETE")}>
                  <X />
                </button>
              </div>
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
      </form>
    </Form>
  )
}
