"use client"

import { useMutation } from "@tanstack/react-query"
import { Check, ChevronsUpDown, PlusCircle, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function OrganizationSwitcher() {
  const { open: sidebarOpen } = useSidebar()
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()

  // Fetch organizations with React Query
  const { data: organizations, isPending: isLoadingOrganizations } =
    authClient.useListOrganizations()

  // Fetch active organization with React Query
  const { data: activeOrg, isPending: isLoadingActiveOrg } =
    authClient.useActiveOrganization()

  // Mutation for switching organizations
  const switchOrgMutation = useMutation({
    mutationFn: (organizationId: string) =>
      authClient.organization.setActive({ organizationId }),
    onSuccess: async () => {
      toast.success("Organization switched successfully")
      router.refresh()
    },
    onError: (error) => {
      console.error("Error switching organization:", error)
      toast.error("Failed to switch organization")
    }
  })

  const isLoading = isLoadingOrganizations || isLoadingActiveOrg

  const switchOrganization = async (orgId: string) => {
    await switchOrgMutation.mutateAsync(orgId)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-between")}
            size={sidebarOpen ? "default" : "icon"}
          >
            <span
              className={
                "flex h-8 w-full items-center gap-2 rounded-md text-left outline-hidden transition-[width,height,padding] duration-200 ease-linear group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4"
              }
            >
              {activeOrg ? (
                <>
                  <Users />
                  <span>{activeOrg.name}</span>
                </>
              ) : (
                <>
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-20" />
                </>
              )}
            </span>
            {sidebarOpen ? (
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            ) : null}
          </Button>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {isLoading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : organizations?.length === 0 ? (
          <DropdownMenuItem disabled>No organizations</DropdownMenuItem>
        ) : (
          organizations?.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className={cn(
                "flex items-center gap-2",
                activeOrg?.id === org.id && "bg-accent"
              )}
            >
              <Users className="h-4 w-4" />
              <span className="truncate">{org.name}</span>
              {activeOrg?.id === org.id && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/new-organization")}>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Organization</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
