"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { Check, Pen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const profileFormSchema = z.object({
  profileImage: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpeg, .png and .webp formats are supported."
    )
    .nullable(),
  name: z.string().min(3).max(20),
  email: z.string().email()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function SettingsProfile() {
  const [isUpdated, setIsUpdated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChangedEmail, setIsChangedEmail] = useState(false)

  const { data: session, refetch: refetchSession } = authClient.useSession()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profileImage: null,
      name: session?.user.name,
      email: session?.user.email
    },
    mode: "onChange"
  })

  const profileImage = form.watch("profileImage")
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (profileImage) {
      fileToImgUrl(profileImage)
        .then((url) => setProfileImageUrl(url))
        .catch((err) => {
          console.error(err)
          setProfileImageUrl(null)
          toast.error("Failed to upload image")
        })
    } else {
      setProfileImageUrl(null)
    }
  }, [profileImage])

  async function onSubmit(data: ProfileFormValues) {
    const isNameChanged = data.name !== session?.user.name
    const isEmailChanged = data.email
      ? data.email !== session?.user.email
      : false
    setIsLoading(true)

    const { data: imageUrl, error: imageUploadError } = data.profileImage
      ? await uploadFile(data.profileImage, "profileImageUploader")
      : { data: undefined, error: undefined }

    if (imageUploadError) {
      toast.error("Failed to upload image")
      console.error(imageUploadError)
      setIsLoading(false)
      form.reset({
        profileImage: null,
        name: session?.user.name,
        email: session?.user.email
      })
      return
    }

    const [updateUserResult, changeEmailResult] = await Promise.all([
      isNameChanged || imageUrl
        ? authClient.updateUser({
            name: isNameChanged ? data.name : session?.user.name,
            image: imageUrl ?? session?.user.image
          })
        : Promise.resolve({ error: null }),
      isEmailChanged
        ? authClient.changeEmail({
            newEmail: data.email,
            callbackURL: "/dashboard"
          })
        : Promise.resolve({ error: null })
    ])
    setIsLoading(false)

    if (updateUserResult.error) {
      toast.error("Failed to update profile")
      console.error(updateUserResult.error)
      form.reset({
        profileImage: null,
        name: session?.user.name,
        email: session?.user.email
      })
      return
    }

    if (changeEmailResult.error) {
      toast.error("Failed to change email")
      console.error(changeEmailResult.error)
      form.reset({
        profileImage: null,
        name: data.name,
        email: session?.user.email
      })
      return
    }
    if ("data" in changeEmailResult) {
      setIsChangedEmail(true)
    }

    form.reset({
      profileImage: null,
      name: data.name,
      email: data.email
    })
    setIsUpdated(true)
    refetchSession()
    toast.success("Profile successfully updated!")
  }

  useEffect(() => {
    form.reset({
      profileImage: null,
      name: session?.user.name,
      email: session?.user.email
    })
  }, [session])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="profileImage"
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
                <Avatar className="size-20">
                  <AvatarImage
                    src={profileImageUrl ?? (session?.user.image as string)}
                  />
                  <AvatarFallback>
                    {session?.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name. It can be your real name or
                  a pseudonym.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          disabled
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="john.doe@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Can&apos;t change your email address, please contact support.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update profile"}
          </Button>
          {isUpdated && !isLoading ? (
            <Check className="animate-scale size-4" />
          ) : null}
        </div>
        {isChangedEmail ? (
          <p className="text-muted-foreground text-sm">
            You will need to verify your new email address.{" "}
            <Button variant="link" size="sm">
              <Link href={`mailto:${session?.user.email}`}>Go to inbox</Link>
            </Button>
          </p>
        ) : null}
      </form>
    </Form>
  )
}
