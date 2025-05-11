"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Layout,
  LayoutDashboard,
  Loader2,
  Minimize,
  User,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import { useForm, type ControllerRenderProps } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

const organizationSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  teamType: z.enum(["solo", "team"]),
  layoutType: z.enum(["default", "minimalist", "detailed"])
})

type OrganizationSchema = z.infer<typeof organizationSchema>

export default function NewOrganizationPage() {
  const session = authClient.useSession()
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)

  const form = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      teamType: "solo",
      layoutType: "default"
    }
  })

  // Function to check if slug is available
  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (slug.length < 3) return

      setIsCheckingSlug(true)
      setSlugError(null)

      try {
        const response = await authClient.organization.checkSlug({
          slug
        })

        if (response.error) {
          setSlugError("This slug is already taken. Please choose another one.")
          form.setError("slug", {
            type: "manual",
            message: "This slug is already taken. Please choose another one."
          })
        } else {
          form.clearErrors("slug")
        }
      } catch (error) {
        console.error("Error checking slug availability:", error)
      } finally {
        setIsCheckingSlug(false)
      }
    },
    [form]
  )

  // Check slug availability when slug changes
  const slug = form.watch("slug")
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (slug.length >= 3) {
        checkSlugAvailability(slug)
      }
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [slug, checkSlugAvailability])

  const onSubmit = async (data: OrganizationSchema) => {
    setIsLoading(true)
    try {
      if (!session.data) {
        toast.error("Not authenticated")
        setIsLoading(false)
        return
      }

      // Check slug availability one more time before submitting
      const slugResponse = await authClient.organization.checkSlug({
        slug: data.slug
      })

      if (slugResponse.error) {
        setSlugError("This slug is already taken. Please choose another one.")
        form.setError("slug", {
          type: "manual",
          message: "This slug is already taken. Please choose another one."
        })
        setIsLoading(false)
        return
      }

      // Create organization using better-auth organization plugin
      const response = await authClient.organization.create({
        name: data.name,
        slug: data.slug,
        metadata: {
          teamType: data.teamType,
          layoutType: data.layoutType
        },
        userId: session.data.user.id
      })

      if (response.error) {
        toast.error(response.error.message ?? response.error.statusText)
      } else {
        toast.success(`Organization "${data.name}" created successfully!`)
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Failed to create organization. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to generate a slug from the name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, "-")
  }

  const handleNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<OrganizationSchema, "name" | "slug">
  ) => {
    field.onChange(e)
    // Auto-generate slug when name changes
    const newSlug = generateSlug(e.target.value)
    form.setValue("slug", newSlug)
  }

  return (
    <div className="container mx-auto flex max-w-[900px] flex-col items-center justify-center py-20">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex flex-col items-center">
            <Icons.icon className="size-24" />
            <h1 className="-mt-2 font-bold">Tasklytic</h1>
          </div>
          <p className="text-muted-foreground">{siteConfig.description}</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === "Enter" && step === 1) {
                e.preventDefault()
              }
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create your organization</CardTitle>
                <CardDescription>
                  {step === 1
                    ? "How would you like to use Tasklytic?"
                    : "Choose your default layout"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 1 ? (
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="My Workspace"
                              {...field}
                              onChange={(e) => handleNameInput(e, field)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <FormLabel>URL Slug</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="my-workspace"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  setSlugError(null)
                                }}
                              />
                            </FormControl>
                            <AnimatePresence>
                              {isCheckingSlug ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{
                                    opacity: 1
                                  }}
                                  exit={{ opacity: 0 }}
                                  className="absolute top-1/2 right-3 flex h-4 w-4 -translate-y-1/2 items-center justify-center"
                                >
                                  <Loader2 className="animate-spin" />
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            This will be used in URLs for your organization
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Usage Type</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            <FormControl>
                              <button
                                type="button"
                                className={cn(
                                  "hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4",
                                  field.value === "solo" &&
                                    "border-primary bg-primary/5"
                                )}
                                onClick={() =>
                                  form.setValue("teamType", "solo")
                                }
                              >
                                <User className="mb-2 h-10 w-10" />
                                <div className="text-center">
                                  <p className="font-medium">Solo</p>
                                  <p className="text-muted-foreground text-xs">
                                    Use Tasklytic alone
                                  </p>
                                </div>
                              </button>
                            </FormControl>
                            <FormControl>
                              <button
                                type="button"
                                className={cn(
                                  "hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4",
                                  field.value === "team" &&
                                    "border-primary bg-primary/5"
                                )}
                                onClick={() =>
                                  form.setValue("teamType", "team")
                                }
                              >
                                <Users className="mb-2 h-10 w-10" />
                                <div className="text-center">
                                  <p className="font-medium">Team</p>
                                  <p className="text-muted-foreground text-xs">
                                    Collaborate with others
                                  </p>
                                </div>
                              </button>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="layoutType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel>Layout Style</FormLabel>
                        <div className="grid gap-4">
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                "hover:border-primary flex w-full cursor-pointer items-start gap-4 rounded-lg border p-4 text-left",
                                field.value === "default" &&
                                  "border-primary bg-primary/5"
                              )}
                              onClick={() =>
                                form.setValue("layoutType", "default")
                              }
                            >
                              <Layout className="mt-1 h-5 w-5" />
                              <div>
                                <p className="font-medium">Default</p>
                                <p className="text-muted-foreground text-sm">
                                  Standard layout with sidebar navigation and
                                  content area
                                </p>
                              </div>
                            </button>
                          </FormControl>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                "hover:border-primary flex w-full cursor-pointer items-start gap-4 rounded-lg border p-4 text-left",
                                field.value === "minimalist" &&
                                  "border-primary bg-primary/5"
                              )}
                              onClick={() =>
                                form.setValue("layoutType", "minimalist")
                              }
                            >
                              <Minimize className="mt-1 h-5 w-5" />
                              <div>
                                <p className="font-medium">Minimalist</p>
                                <p className="text-muted-foreground text-sm">
                                  Clean interface with minimal distractions
                                </p>
                              </div>
                            </button>
                          </FormControl>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                "hover:border-primary flex w-full cursor-pointer items-start gap-4 rounded-lg border p-4 text-left",
                                field.value === "detailed" &&
                                  "border-primary bg-primary/5"
                              )}
                              onClick={() =>
                                form.setValue("layoutType", "detailed")
                              }
                            >
                              <LayoutDashboard className="mt-1 h-5 w-5" />
                              <div>
                                <p className="font-medium">Detailed</p>
                                <p className="text-muted-foreground text-sm">
                                  Dashboard-focused view with comprehensive
                                  analytics
                                </p>
                              </div>
                            </button>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {step === 2 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isLoading || session.isPending || isCheckingSlug
                      }
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Organization
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (!form.formState.isValid || slugError) return
                        setStep(2)
                      }}
                      disabled={!form.formState.isValid || isCheckingSlug}
                    >
                      Next
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}
