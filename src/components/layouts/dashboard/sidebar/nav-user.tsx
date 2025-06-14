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

import { ModeToggle } from "@/components/mode-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"
import type { User } from "better-auth"
import { HomeIcon, SettingsIcon, UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NavUser() {
  const { openSettingsDialog } = useSettingsDialog()
  const t = useTranslations("Dashboard.Sidebar.NavUser")
  const { data: session, isPending, error } = authClient.useSession()
  const user = session?.user

  const { data: activeOrg, isPending: isLoadingActiveOrg } =
    authClient.useActiveOrganization()
  const { isMobile } = useSidebar()
  const router = useRouter()

  if (error) {
    toast.error("Error fetching user.")
  }

  const handleSignOut = () => {
    if (isLoadingActiveOrg || !user)
      return toast.error("Loading application data, can't sign out right now.")

    if (activeOrg) localStorage.setItem(`activeOrg:${user.id}`, activeOrg.id)

    void authClient.signOut({
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
              <DropdownMenuItem
                onClick={openSettingsDialog.bind(null, "security")}
              >
                <SettingsIcon />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/home">
                  <HomeIcon />
                  {t("homePage")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function UserAvatar({
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
