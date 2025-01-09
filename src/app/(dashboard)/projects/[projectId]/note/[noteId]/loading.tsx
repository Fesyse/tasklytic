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

      {/* <FixedToolbar className="relative w-full">
        <ScrollArea
          aria-orientation="horizontal"
          className="w-full overflow-x-auto"
        >
          <div className="flex w-max max-w-full px-3">
            <FixedToolbarButtons />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </FixedToolbar> */}
    </div>
  )
}
