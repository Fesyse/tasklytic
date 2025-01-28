"use client"

import { ChevronDownIcon, PlusIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarNav } from "@/lib/sidebar"

export function ProjectSwitcher({
  projects
}: {
  projects: SidebarNav["projects"]
}) {
  const { projectId } = useParams<{ projectId: string }>()
  const [activeProject, setActiveProject] = useState(
    projects.items?.find(p => p.id === projectId)
  )

  useEffect(() => {
    const newActiveProject = projects.items?.find(p => p.id === projectId)
    setActiveProject(newActiveProject)
  }, [projectId, projects])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {projects.isProjectPage ? (
              <SidebarMenuButton className="w-fit px-1.5">
                <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  {activeProject && !projects.isLoading ? (
                    <activeProject.logo className="size-3" />
                  ) : (
                    <Skeleton className="size-3 rounded" />
                  )}
                </div>
                <span className="truncate font-semibold">
                  {activeProject && !projects.isLoading ? (
                    activeProject.name
                  ) : (
                    <Skeleton className="h-4 w-16" />
                  )}
                </span>
                <ChevronDownIcon className="opacity-50" />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton className="w-fit px-1.5">
                <ChevronDownIcon className="opacity-50" />
                <span className="truncate font-semibold">Select project</span>
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Projects
            </DropdownMenuLabel>
            {projects.items?.length && !projects.isLoading
              ? projects.items?.map((project, index) => (
                  <DropdownMenuItem
                    key={project.name}
                    className="gap-2 p-2"
                    asChild
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      data-active={project.id === projectId}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <project.logo className="size-4 shrink-0" />
                      </div>
                      {project.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                ))
              : projects.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <DropdownMenuItem key={i}>
                      <SidebarMenuSkeleton />
                    </DropdownMenuItem>
                  ))
                : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" asChild>
              <Link href="/create-project">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add project
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
