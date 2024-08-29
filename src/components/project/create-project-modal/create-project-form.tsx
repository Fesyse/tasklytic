import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { type CreateProjectSchema, createProjectSchema } from "@/lib/schemas"

export const CreateProjectForm = () => {
  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema)
  })

  return (
    <Form {...form}>
      <form></form>
    </Form>
  )
}
