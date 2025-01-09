import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Check } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, random } from "@/lib/utils"

export default function NoteLoading() {
  return (
    <div className="flex flex-col items-between w-full">
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Skeleton className="h-7 w-36" />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="hidden select-none font-medium text-muted-foreground md:inline-flex md:items-center md:gap-2">
              <span className="flex items-center gap-1">
                Saved
                <Check size={14} className="text-muted-foreground" />
              </span>
              |
              <span className="flex items-center gap-1">
                Edited <Skeleton className="h-5 w-14" />
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-[state=open]:bg-accent"
            >
              <DotsHorizontalIcon />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex px-3 gap-2 justify-center py-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <ToolbarGroup key={index}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="rounded-sm h-7 aspect-square" />
            ))}
          </ToolbarGroup>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[900px] py-28 font-comfortaa">
        <div className="flex items-center gap-4 px-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="flex flex-wrap gap-1 mt-4 px-4">
          {Array.from({ length: 100 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-[1.125rem]"
              style={{
                width: random(50, 250),
                marginRight: random(5, 10)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("group/toolbar-group", "relative")}>
      <div className="flex items-center gap-1">{children}</div>

      <div className="mx-1.5 py-0.5">
        <Separator orientation="vertical" />
      </div>
    </div>
  )
}
