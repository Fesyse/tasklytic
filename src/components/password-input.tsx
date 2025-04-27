import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
export function PasswordInput({
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <Input {...props} type={showPassword ? "text" : "password"} />
      <button
        className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </>
  )
}
