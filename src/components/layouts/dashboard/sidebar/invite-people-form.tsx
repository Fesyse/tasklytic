"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2, Mail, PlusCircle, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const emailSchema = z.string().email("Please enter a valid email address")

const invitePeopleSchema = z.object({
  email: emailSchema
})

type InvitePeopleSchema = z.infer<typeof invitePeopleSchema>

export const InvitePeopleForm = () => {
  // State for tracking the email input and verification status
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null)
  const [debouncedEmail, setDebouncedEmail] = useState("")
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([])

  // Initialize form
  const form = useForm<InvitePeopleSchema>({
    resolver: zodResolver(invitePeopleSchema),
    defaultValues: {
      email: ""
    }
  })

  // Watch for email changes
  const emailValue = form.watch("email")

  // Use tRPC to search for users by email
  const { data: searchedUsers, status } = api.users.searchMany.useQuery(
    { email: debouncedEmail },
    {
      enabled: !!debouncedEmail && emailSchema.safeParse(debouncedEmail).success
    }
  )

  useEffect(() => {
    if (status === "success") {
      setIsCheckingEmail(false)
      setIsExistingUser(searchedUsers.length > 0)
    } else {
      setIsCheckingEmail(false)
      setIsExistingUser(null)
    }
  }, [status])

  // Debounce email search to avoid too many requests
  useEffect(() => {
    if (!emailValue || !emailSchema.safeParse(emailValue).success) {
      setIsExistingUser(null)
      return
    }

    setIsCheckingEmail(true)
    const timerId = setTimeout(() => {
      setDebouncedEmail(emailValue)
    }, 500)

    return () => clearTimeout(timerId)
  }, [emailValue])

  // Handle invitation submission
  const handleInviteUser = () => {
    const { email } = form.getValues()

    if (!email || !emailSchema.safeParse(email).success) {
      return
    }

    // Add email to the list and reset form
    setEmailsToInvite([...emailsToInvite, email])
    form.reset({ email: "" })
    setIsExistingUser(null)
    toast.success(`Invitation ready: ${email}`)
  }

  // Handle removing an email from the invitation list
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailsToInvite(emailsToInvite.filter((email) => email !== emailToRemove))
  }

  // Handle final submission of all invitations
  const onSubmit = () => {
    if (emailsToInvite.length === 0) {
      toast.error("Add at least one email address to invite")
      return
    }

    // Here the user would handle the actual invitation process
    // As specified in your requirements, you'll handle this part
    toast.success(`${emailsToInvite.length} invitation(s) sent!`)

    // Reset form state
    setEmailsToInvite([])
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="relative">
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Type an email address..."
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setIsInputFocused(false), 200)
                      }
                    />
                    {emailValue &&
                      emailSchema.safeParse(emailValue).success && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                          onClick={handleInviteUser}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </FormControl>
                <Popover
                  open={
                    isInputFocused &&
                    !!emailValue &&
                    emailSchema.safeParse(emailValue).success
                  }
                >
                  <PopoverContent className="w-80 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm font-medium">
                          {emailValue}
                        </span>
                      </div>
                      <div>
                        {isCheckingEmail ? (
                          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                        ) : isExistingUser === true ? (
                          <div className="flex items-center gap-1 text-sm text-green-500">
                            <Check className="h-4 w-4" />
                            <span>User exists</span>
                          </div>
                        ) : isExistingUser === false ? (
                          <div className="flex items-center gap-1 text-sm text-amber-500">
                            <span>New user</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Display emails to be invited */}
        {emailsToInvite.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">People to invite:</p>
            <div className="space-y-2">
              {emailsToInvite.map((email) => (
                <div
                  key={email}
                  className="bg-muted/40 flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <span className="truncate">{email}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleRemoveEmail(email)}
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
          type="button"
          className="w-full"
          disabled={emailsToInvite.length === 0}
          onClick={onSubmit}
        >
          Invite people
        </Button>
      </div>
    </Form>
  )
}
