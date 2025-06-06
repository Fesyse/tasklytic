"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { useInvitationCount } from "@/hooks/use-invitation-count"
import { authClient } from "@/lib/auth-client"
import { api } from "@/trpc/react"
import { Loader2, MailIcon, RefreshCw, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

export const InvitationsDialog = () => {
  const t = useTranslations("Dashboard.Sidebar")
  const [open, setOpen] = useState(false)

  // Use our custom hook to get the invitation count with auto-refresh
  const pendingInvitationsCount = useInvitationCount()

  // State for tracking currently processing invitations
  const [processingInvitations, setProcessingInvitations] = useState<{
    [key: string]: { accepting: boolean; rejecting: boolean }
  }>({})

  // Fetch user invitations
  const {
    data: invitations,
    isLoading,
    error,
    refetch,
    isRefetching
  } = api.organization.getInvitations.useQuery(undefined, {
    enabled: open // Only fetch when dialog is open
  })

  // Handle refreshing invitations
  const handleRefresh = async () => {
    try {
      await refetch()
    } catch (err) {
      toast.error("Failed to refresh invitations", {
        description: err instanceof Error ? err.message : undefined
      })
    }
  }

  // Handle accepting an invitation
  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingInvitations((prev) => ({
      ...prev,
      [invitationId]: { accepting: true, rejecting: false }
    }))

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to accept invitation")
        return
      }

      toast.success("Invitation accepted successfully")
      refetch() // Refresh the list of invitations

      // Close dialog after a short delay if no more invitations
      if ((invitations?.length || 0) <= 1) {
        setTimeout(() => {
          setOpen(false)
        }, 1500)
      }
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred while accepting the invitation"
      )
    } finally {
      setProcessingInvitations((prev) => ({
        ...prev,
        [invitationId]: { accepting: false, rejecting: false }
      }))
    }
  }

  // Handle rejecting an invitation
  const handleRejectInvitation = async (invitationId: string) => {
    setProcessingInvitations((prev) => ({
      ...prev,
      [invitationId]: { accepting: false, rejecting: true }
    }))

    try {
      const result = await authClient.organization.rejectInvitation({
        invitationId
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to reject invitation")
        return
      }

      toast.success("Invitation rejected")
      refetch() // Refresh the list of invitations
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred while rejecting the invitation"
      )
    } finally {
      setProcessingInvitations((prev) => ({
        ...prev,
        [invitationId]: { accepting: false, rejecting: false }
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <MailIcon />
            <span>{t("NavSecondary.invitations")}</span>
            {pendingInvitationsCount > 0 && (
              <SidebarMenuBadge>{pendingInvitationsCount}</SidebarMenuBadge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("InvitationsDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("InvitationsDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <XCircle className="text-destructive mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {t("InvitationsDialog.errorFallback")}
            </p>
          </div>
        ) : invitations?.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              {t("InvitationsDialog.noInvitationsFallback")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {invitations?.map((invitation) => {
              const isProcessing =
                processingInvitations[invitation.id]?.accepting ||
                processingInvitations[invitation.id]?.rejecting

              return (
                <Card key={invitation.id} className="overflow-hidden py-0">
                  <CardContent className="px-4 pt-4">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {invitation.organizationName ??
                          t("InvitationsDialog.Invitation.organization")}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Invited by:{" "}
                        <span className="font-medium">
                          {invitation.inviterEmail ??
                            t("InvitationsDialog.Invitation.unknownInviter")}
                        </span>
                      </p>
                      <p className="text-sm">
                        Role:{" "}
                        <Badge variant="outline" className="capitalize">
                          {invitation.role ??
                            t("InvitationsDialog.Invitation.member")}
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex justify-between gap-2 border-t !p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="grow"
                      onClick={() => handleRejectInvitation(invitation.id)}
                      disabled={isProcessing}
                    >
                      {processingInvitations[invitation.id]?.rejecting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          {t("InvitationsDialog.Invitation.rejectingFallback")}
                        </>
                      ) : (
                        t("InvitationsDialog.Invitation.decline")
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="grow"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={isProcessing}
                    >
                      {processingInvitations[invitation.id]?.accepting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          {t("InvitationsDialog.Invitation.acceptingFallback")}
                        </>
                      ) : (
                        t("InvitationsDialog.Invitation.accept")
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            title={t("InvitationsDialog.Invitation.refresh")}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
