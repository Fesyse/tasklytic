import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SignInMenuButtonProps {
  isOpen: boolean | undefined
}

export function SignInMenuButton({ isOpen }: SignInMenuButtonProps) {
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button variant="outline" className="w-full justify-center h-10 mt-5">
            <span
              className={cn({
                "mr-4": isOpen
              })}
            >
              <LogOut size={18} />
            </span>
            <p
              className={cn("whitespace-nowrap", {
                "opacity-0 hidden": !isOpen,
                "opacity-100": isOpen
              })}
            >
              Sign out
            </p>
          </Button>
        </TooltipTrigger>
        {!isOpen && <TooltipContent side="right">Sign out</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}
