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
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get("id")

  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  // Get user session to check if logged in
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
    console.log(sessionLoading, session)
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

      toast.success("Invitation rejected")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
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
            <CardTitle>Organization Invitation</CardTitle>
            <CardDescription>Loading invitation details...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }
  console.log(errors)

  // Show error state
  if (errors) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              There was a problem with this invitation
            </CardDescription>
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
              Return to Dashboard
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
            <CardTitle className="text-primary">Invitation Accepted</CardTitle>
            <CardDescription>
              You have successfully joined the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="text-primary mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Redirecting you to the dashboard...
            </p>
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
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You have been invited to join{" "}
            {invitation?.organizationName || "an organization"}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              You were invited by{" "}
              <span className="font-medium">
                {invitation?.inviterEmail || "a team member"}
              </span>{" "}
              to join their organization.
            </p>
            <p className="text-sm">
              Role:{" "}
              <span className="font-medium capitalize">
                {invitation?.role || "Member"}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...
              </>
            ) : (
              "Accept Invitation"
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...
              </>
            ) : (
              "Reject Invitation"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
