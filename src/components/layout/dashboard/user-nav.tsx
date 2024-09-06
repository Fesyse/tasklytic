"use client"

import { LayoutGrid, LogIn, LogOut, User } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function UserNav() {
  const { data, status } = useSession()
  const user = data?.user

  const sign = async (type: "out" | "in") => {
    if (type === "out") {
      await signOut()
      toast.success(`Successfully signed out.`)
    } else return signIn()
  }
  return ((user && status !== "loading") ?? status === "unauthenticated") ? (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <Image
                    className={cn("h-full w-full", {
                      "dark:invert": !user?.image
                    })}
                    src={user?.image ?? "/user.svg"}
                    alt="Avatar"
                    width={32}
                    height={32}
                  />
                  <AvatarFallback>
                    {(user?.name ?? "guest").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        className="w-56 font-comfortaa"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name ?? "Guest"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email ?? "No email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/projects" className="flex items-center">
              <LayoutGrid className="mr-3 h-4 w-4 text-muted-foreground" />
              Projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => (user ? sign("out") : sign("in"))}
          >
            {user ? (
              <>
                <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
                Sign out
              </>
            ) : (
              <>
                <LogIn className="mr-3 h-4 w-4 text-muted-foreground" />
                Sign in
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ThemeToggle expanded />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Skeleton className="h-8 w-8 rounded-full bg-primary/10" />
  )
}
