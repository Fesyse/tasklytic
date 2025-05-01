"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NavUser() {
  const { data: session, isPending, error } = authClient.useSession()
  const user = session?.user

  const { isMobile } = useSidebar()
  const router = useRouter()

  if (error) {
    toast.error("Error fetching user.")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isPending ? (
                <Skeleton className="h-8 w-8 rounded-lg" />
              ) : (
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage
                    src={user?.image ?? "/user.svg"}
                    alt={user?.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              {isPending ? (
                <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                  <Skeleton className="h-4 w-12 rounded-lg" />
                  <Skeleton className="h-4 w-25 rounded-lg" />
                </div>
              ) : (
                <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              )}
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.image ?? "/user.svg"}
                    alt={user?.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onError: (error) => {
                      toast.error("Error signing out, try again later.", {
                        description: error.error?.message
                      })
                    },
                    onSuccess: () => {
                      toast.success("Signed out successfully!")
                      router.push("/")
                    }
                  }
                })
              }
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
