import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
export function PasswordInput({
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <Input {...props} type={showPassword ? "text" : "password"} />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="text-muted-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </>
  )
}
