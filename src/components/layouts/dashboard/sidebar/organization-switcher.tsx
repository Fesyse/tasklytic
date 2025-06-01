"use client"

import { useMutation } from "@tanstack/react-query"
import { Check, ChevronsUpDown, PlusCircle, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
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
import { SidebarMenuSkeleton, useSidebar } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function OrganizationSwitcher() {
  const { open: sidebarOpen } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const {
    data: organizations,
    isPending: isLoadingOrganizations,
    error: organizationsError,
    isRefetching
  } = authClient.useListOrganizations()
  const { data: session } = authClient.useSession()
  const user = session?.user

  const { data: activeOrg, isPending: isLoadingActiveOrg } =
    authClient.useActiveOrganization()

  const activeOrgIdFromLocalStorage = useMemo(() => {
    if (typeof window === "undefined") return null
    const activeOrgId = localStorage.getItem(`activeOrg:${user?.id}`)
    return activeOrgId ? activeOrgId : null
  }, [user?.id])

  // Mutation for switching organizations
  const switchOrgMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const { error } = await authClient.organization.setActive({
        organizationId
      })
      if (error) throw error
    },
    onError: (error) => {
      console.error("Error switching organization:", error)
      toast.error("Failed to switch organization")
    },
    onSuccess: () => {
      toast.success("Organization switched successfully")
      router.push("/dashboard")
    }
  })

  const isLoading = isLoadingOrganizations || isLoadingActiveOrg

  const switchOrganization = async (orgId: string) => {
    await switchOrgMutation.mutateAsync(orgId)
  }

  useEffect(() => {
    if (organizationsError) {
      toast.error(
        organizationsError?.message || "Failed to get your organizations"
      )
      return
    }
    if (!organizations?.length && !isLoadingOrganizations && !isRefetching) {
      router.push("/new-organization")
    }
  }, [organizations, isLoadingOrganizations, organizationsError, isRefetching])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="group/menu-item relative grow transition-all duration-200 ease-in-out">
        {activeOrg ||
        activeOrgIdFromLocalStorage ||
        (!isLoadingActiveOrg && !isLoadingOrganizations) ? (
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              size={sidebarOpen ? "default" : "icon"}
            >
              <span
                className={
                  "flex h-8 w-full items-center gap-2 rounded-md text-left outline-hidden transition-[width,height,padding] duration-200 ease-linear group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4"
                }
              >
                <Users />
                <span>
                  {activeOrg
                    ? activeOrg.name
                    : (
                        organizations?.find(
                          (org) => org.id === activeOrgIdFromLocalStorage
                        ) ?? organizations?.[0]
                      )?.name}
                </span>
              </span>
              {sidebarOpen ? (
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
        ) : (
          <SidebarMenuSkeleton showIcon className="h-9 w-full p-2" />
        )}
      </div>
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
