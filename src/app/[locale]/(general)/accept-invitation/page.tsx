"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { toast } from "sonner"

function AcceptInvitationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get("id")
  const isNewUser = searchParams.get("isNewUser") === "1"
  const t = useTranslations("AcceptInvitation")

  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const {
    data: invitation,
    error: invitationError,
    isLoading: isInvitationLoading
  } = useQuery({
    queryKey: ["invitation", invitationId],
    queryFn: async () => {
      if (!invitationId) {
        throw new Error("Invitation ID is missing")
      }

      const invitationData = await authClient.organization.getInvitation({
        query: {
          id: invitationId
        }
      })

      if (invitationData.error) {
        throw new Error(
          invitationData.error.message || "Failed to retrieve invitation"
        )
      }

      return invitationData.data
    },
    enabled: !sessionLoading && !!invitationId
  })

  const errors = error ?? invitationError?.message

  // Redirect to sign-in if user is not logged in
  useEffect(() => {
    if (!sessionLoading && !session && invitationId) {
      router.push(`/auth/sign-in?invitationId=${invitationId}`)
    }
  }, [session, sessionLoading, invitationId, router])

  const handleAcceptInvitation = async () => {
    if (!invitationId) return

    setAccepting(true)
    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to accept invitation")
        setError(result.error.message || "Failed to accept invitation")
        setAccepting(false)
        return
      }

      setSuccess(true)
      toast.success("Invitation accepted successfully")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred while accepting the invitation"
      )
      setError(
        err.message || "An error occurred while accepting the invitation"
      )
    } finally {
      setAccepting(false)
    }
  }

  const handleRejectInvitation = async () => {
    if (!invitationId) return

    setRejecting(true)
    try {
      const result = await authClient.organization.rejectInvitation({
        invitationId
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to reject invitation")
        setError(result.error.message || "Failed to reject invitation")
        setRejecting(false)
        return
      }

      toast.success("Invitation rejected", {
        description: isNewUser
          ? "Redirecting to create new organization, because youre dont have one"
          : undefined
      })

      setTimeout(() => {
        router.push(isNewUser ? "/new-organization" : "/dashboard")
      }, 2000)
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred while rejecting the invitation"
      )
      setError(
        err.message || "An error occurred while rejecting the invitation"
      )
    } finally {
      setRejecting(false)
    }
  }

  // Show loading state
  if (isInvitationLoading || sessionLoading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("loadingDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (errors) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              {t("errorTitle")}
            </CardTitle>
            <CardDescription>{t("errorMessage")}</CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-center">
            <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">{errors}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              {t("returnToDashboard")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Show success state
  if (success) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-primary">{t("acceptedTitle")}</CardTitle>
            <CardDescription>{t("acceptedMessage")}</CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="text-primary mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">{t("redirecting")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show invitation details and action buttons
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("invitedToJoin")}{" "}
            {invitation?.organizationName || t("anOrganization")}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              {t("invitedBy")}{" "}
              <span className="font-medium">
                {invitation?.inviterEmail || t("aTeamMember")}
              </span>{" "}
              {t("toJoinOrganization")}
            </p>
            <p className="text-sm">
              {t("role")}{" "}
              <span className="font-medium capitalize">
                {invitation?.role || t("memberRole")}
              </span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            className="w-full"
            onClick={handleAcceptInvitation}
            disabled={accepting || rejecting}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("acceptingButton")}
              </>
            ) : (
              t("acceptButton")
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRejectInvitation}
            disabled={accepting || rejecting}
          >
            {rejecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("rejectingButton")}
              </>
            ) : (
              t("rejectButton")
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function InvitationSkeleton() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto h-6 w-2/3 animate-pulse rounded-md"></div>
          <div className="bg-muted mx-auto mt-2 h-4 w-4/5 animate-pulse rounded-md opacity-70"></div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-4 text-center">
            <div className="bg-muted mx-auto h-4 w-3/4 animate-pulse rounded-md"></div>
            <div className="bg-muted mx-auto h-4 w-1/2 animate-pulse rounded-md"></div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="bg-muted h-10 w-full animate-pulse rounded-md"></div>
          <div className="bg-muted h-10 w-full animate-pulse rounded-md opacity-70"></div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<InvitationSkeleton />}>
      <AcceptInvitationPageContent />
    </Suspense>
  )
}
