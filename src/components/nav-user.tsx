"use client"

import { IconDotsVertical, IconLogout } from "@tabler/icons-react"

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
import type { User } from "better-auth"
import { SettingsIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ModeToggle } from "./mode-toggle"

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
              <UserAvatar user={user} isPending={isPending} />
              <UserDetails user={user} isPending={isPending} />

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
                <UserAvatar user={user} isPending={isPending} />
                <UserDetails user={user} isPending={isPending} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <ModeToggle
                  expanded
                  className="hover:!bg-accent !bg-transparent !px-2"
                />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
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

function UserAvatar({
  user,
  isPending
}: {
  user: User | undefined
  isPending: boolean
}) {
  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-lg" />
  }

  if (user?.image) {
    return (
      <Avatar className="h-8 w-8 rounded-lg grayscale">
        <AvatarImage src={user?.image} alt={user?.name} />
        <AvatarFallback className="rounded-lg">
          {user?.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
      <UserIcon className="size-4" />
    </Avatar>
  )
}

function UserDetails({
  user,
  isPending
}: {
  user: User | undefined
  isPending: boolean
}) {
  if (isPending) {
    return (
      <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
        <Skeleton className="h-4 w-12 rounded-lg" />
        <Skeleton className="h-4 w-25 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{user?.name}</span>
      <span className="text-muted-foreground truncate text-xs">
        {user?.email}
      </span>
    </div>
  )
}
