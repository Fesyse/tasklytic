import { LogIn, LogOut } from "lucide-react"
import { useSession } from "next-auth/react"
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
  const user = useSession()?.data?.user

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 mt-5 whitespace-nowrap justify-center group/modal-btn overflow-hidden relative hover:bg-background"
          >
            {isOpen ? (
              <>
                <span
                  className={cn(
                    "group-hover/modal-btn:translate-x-40 text-center transition duration-500",
                    {
                      "opacity-0 hidden": !isOpen,
                      "opacity-100": isOpen
                    }
                  )}
                >
                  {user ? "Sign out" : "Sign in"}
                </span>
                <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                  {user ? <LogOut size={18} /> : <LogIn size={18} />}
                </div>
              </>
            ) : user ? (
              <LogOut size={18} />
            ) : (
              <LogIn size={18} />
            )}
          </Button>
        </TooltipTrigger>
        {!isOpen && (
          <TooltipContent side="right">
            {user ? "Sign out" : "Sign in"}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
