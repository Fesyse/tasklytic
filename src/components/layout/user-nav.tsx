"use client"

import { LayoutGrid, LogIn, LogOut, User } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
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
  console.log(user, status)
  return (user && status !== "loading") || status === "unauthenticated" ? (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="w-8 h-8">
                  <Image
                    className={cn("w-full h-full", {
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
            <Link href="/dashboard" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={() => (user ? sign("out") : sign("in"))}
        >
          {user ? (
            <>
              <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
              Sign out
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-3 text-muted-foreground" />
              Sign in
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Skeleton className="w-8 h-8 rounded-full bg-primary/10" />
  )
}
