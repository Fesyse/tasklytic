"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Mail, PlusCircle, UserIcon, X } from "lucide-react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

type InviteEmail = {
  email: string
  isRegistered: boolean
  user?: {
    id: string
    name: string
    email: string
    image: string | null
  } | null
}

const emailSchema = z.string().email("Please enter a valid email address")

const invitePeopleSchema = z.object({
  email: emailSchema
})

type InvitePeopleSchema = z.infer<typeof invitePeopleSchema>

export const InvitePeopleForm = () => {
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [inviteList, setInviteList] = useState<InviteEmail[]>([])

  const form = useForm<InvitePeopleSchema>({
    resolver: zodResolver(invitePeopleSchema),
    defaultValues: {
      email: ""
    }
  })

  const { data: userData, isPending: isCurrentUserPending } =
    authClient.useSession()

  const utils = api.useUtils()
  const { mutate: invitePeople } = api.organization.invitePeople.useMutation({
    onSuccess: (data) => toast.success(`${data.length} invitation(s) sent!`),
    onError: (error) => {
      console.log(error)
      toast.error(error.message)
    }
  })
  const checkUserExists = useCallback(
    async (email: string) => {
      try {
        const result = await utils.users.getByEmail.fetch({ email })
        return result
      } catch (error) {
        console.error("Error checking user:", error)
        return null
      }
    },
    [utils.users.getByEmail.fetch]
  )

  // Handle adding an email to the invite list
  const handleAddEmail = async () => {
    const { email } = form.getValues()

    // Validate email
    if (!email || !emailSchema.safeParse(email).success) {
      toast.error("Please enter a valid email address")
      return
    }

    // Check if email already in list
    if (inviteList.some((item) => item.email === email)) {
      toast.error("This email is already in your invitation list")
      return
    }

    // Check if user exists
    setIsCheckingEmail(true)
    try {
      if (isCurrentUserPending || !userData || userData.user.email === email) {
        toast.error("You are already in organization!")
        return
      }

      const user = await checkUserExists(email)

      // Add to invite list
      setInviteList([
        ...inviteList,
        {
          email,
          isRegistered: !!user,
          user
        }
      ])

      // Reset form
      form.reset({ email: "" })
      toast.success(`Added ${email} to invitation list`)
    } catch (error) {
      toast.error("Failed to check if user exists")
      console.error(error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Handle removing an email from the invitation list
  const handleRemoveEmail = (emailToRemove: string) => {
    setInviteList(inviteList.filter((item) => item.email !== emailToRemove))
  }

  // Handle final submission of all invitations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inviteList.length === 0) {
      toast.error("Add at least one email address to invite")
      return
    }

    invitePeople({
      invitations: inviteList.map((item) => ({
        email: item.email,
        userId: item.user?.id
      }))
    })

    // Reset form state
    setInviteList([])
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="Type an email address..." />
                  </FormControl>
                  <Button
                    type="button"
                    size="icon"
                    disabled={isCheckingEmail}
                    onClick={handleAddEmail}
                  >
                    {isCheckingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Display emails to be invited */}
        {inviteList.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">People to invite:</p>
            <div className="space-y-2">
              {inviteList.map((item) => (
                <div
                  key={item.email}
                  className="bg-muted/40 flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {item.isRegistered && item.user ? (
                      <Avatar className="h-8 w-8">
                        {item.user.image ? (
                          <AvatarImage
                            src={item.user.image}
                            alt={item.user.name}
                          />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                        <AvatarFallback>
                          {item.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                        <Mail className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                    <span className="truncate font-medium">{item.email}</span>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleRemoveEmail(item.email)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={inviteList.length === 0}
        >
          Invite people
        </Button>
      </form>
    </Form>
  )
}
