"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { authClient } from "@/lib/auth-client"
import { uploadFile } from "@/lib/uploadthing-client"
import { fileToImgUrl } from "@/lib/utils"
import { Pen, UsersIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const organizationGeneralFormSchema = z.object({
  organizationImage: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpeg, .png and .webp formats are supported."
    )
    .nullable(),
  name: z.string().min(3).max(20)
})

type OrganizationGeneralFormValues = z.infer<
  typeof organizationGeneralFormSchema
>

export function SettingsOrganizationGeneral() {
  const t = useTranslations("Dashboard.Settings.tabs.organizationGroup.general")
  const [isLoading, setIsLoading] = useState(false)

  const { data: session } = authClient.useSession()
  const { data: organization } = authClient.useActiveOrganization()

  const form = useForm<OrganizationGeneralFormValues>({
    resolver: zodResolver(organizationGeneralFormSchema),
    defaultValues: {
      organizationImage: null,
      name: session?.user.name
    },
    mode: "onChange"
  })

  const organizationImage = form.watch("organizationImage")
  const [organizationImageUrl, setOrganizationImageUrl] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (organizationImage) {
      fileToImgUrl(organizationImage)
        .then((url) => setOrganizationImageUrl(url))
        .catch((err) => {
          console.error(err)
          setOrganizationImageUrl(null)
          toast.error("Failed to upload image")
        })
    } else {
      setOrganizationImageUrl(null)
    }
  }, [organizationImage])

  async function onSubmit(data: OrganizationGeneralFormValues) {
    setIsLoading(true)

    const { data: newOrganizationLogo, error: imageUploadError } =
      data.organizationImage
        ? await uploadFile(data.organizationImage, "profileImageUploader") // TODO: Implement organizationImageUploader
        : { data: undefined, error: undefined }

    if (imageUploadError) {
      toast.error("Failed to upload image")
      console.error(imageUploadError)
      setIsLoading(false)
      form.reset({
        organizationImage: null,
        name: session?.user.name
      })
      return
    }

    authClient.organization.update({
      data: {
        name: data.name,
        logo: newOrganizationLogo
      }
    })

    setIsLoading(false)

    form.reset({
      organizationImage: null,
      name: data.name
    })
    toast.success("Organization successfully updated!")
  }

  async function handleDeleteOrganization() {
    if (!organization) return

    toast.info("THIS FEATURE IS CURRENTLY UNDER DEVELOPMENT")
    return

    setIsLoading(true)

    const { error } = await authClient.organization.delete({
      organizationId: organization.id
    })

    setIsLoading(false)
    if (!error) {
      toast.success("Organization successfully deleted!")
    }

    // TODO: Redirect to a different page after deletion
  }

  useEffect(() => {
    form.reset({
      organizationImage: null,
      name: session?.user.name
    })
  }, [session])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="organizationImage"
            render={({ field: { value: _value, onChange, ...field } }) => (
              <FormItem className="relative size-20 cursor-pointer">
                <input
                  {...field}
                  type="file"
                  className="absolute top-0 left-0 z-10 block size-full cursor-pointer border-none bg-transparent text-transparent outline-none"
                  accept="image/*"
                  onChange={(event) =>
                    onChange(event.target.files && event.target.files[0])
                  }
                />
                {organizationImageUrl ? (
                  <Avatar className="size-20">
                    <AvatarImage src={organizationImageUrl} />
                    <AvatarFallback>
                      {session?.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UsersIcon className="text-muted-foreground bg-muted size-20 rounded-full p-4" />
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -top-1 -right-1 size-auto rounded-full p-1.5"
                >
                  <Pen className="size-2.5" />
                </Button>
              </FormItem>
            )}
          />
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("organizationName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("organizationName.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("organizationName.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {t("updateButton")}
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">{t("deleteOrganization.title")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("deleteOrganization.description")}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              {t("deleteOrganization.button")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("deleteOrganization.alert.title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteOrganization.alert.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("deleteOrganization.alert.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteOrganization}>
                {t("deleteOrganization.alert.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Form>
  )
}
// export function SettingsOrganizationGeneral() {
//   return <div></div>
// }
