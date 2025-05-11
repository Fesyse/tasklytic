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
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

// Organization types
type OrganizationMetadata = {
  teamType?: "solo" | "team"
  layoutType?: "default" | "minimalist" | "detailed"
}

type OrganizationWithMetadata = {
  id: string
  name: string
  slug: string
  metadata?: OrganizationMetadata
}

type OrganizationSwitcherContextType = {
  organizations: OrganizationWithMetadata[] | null
  activeOrg: OrganizationWithMetadata | null
  isLoading: boolean
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  switchOrganization: (orgId: string) => Promise<void>
}

// Create the context
const OrganizationSwitcherContext =
  React.createContext<OrganizationSwitcherContextType | null>(null)

// Custom hook to use the organization context
export function useOrganizationSwitcher() {
  const context = React.useContext(OrganizationSwitcherContext)

  if (!context) {
    throw new Error(
      "useOrganizationSwitcher must be used within an OrganizationSwitcherProvider"
    )
  }

  return context
}

// Provider component that wraps your app and makes organization data available to any child component that calls useOrganizationSwitcher
export function OrganizationSwitcherProvider({
  children
}: {
  children: React.ReactNode
}) {
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

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo<OrganizationSwitcherContextType>(
    () => ({
      organizations,
      activeOrg,
      isLoading,
      isOpen,
      setIsOpen,
      switchOrganization
    }),
    [organizations, activeOrg, isLoading, isOpen, switchOrganization]
  )

  return (
    <OrganizationSwitcherContext.Provider value={value}>
      {children}
    </OrganizationSwitcherContext.Provider>
  )
}

// The UI component that displays the organization switcher dropdown
export function OrganizationSwitcher() {
  const {
    organizations,
    activeOrg,
    isLoading,
    isOpen,
    setIsOpen,
    switchOrganization
  } = useOrganizationSwitcher()

  const router = useRouter()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2 truncate">
            {activeOrg ? (
              <>
                <Users className="h-4 w-4" />
                <span className="truncate">{activeOrg.name}</span>
              </>
            ) : isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>Select an organization</span>
            )}
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
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
