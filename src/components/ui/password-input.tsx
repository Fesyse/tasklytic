"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function PasswordInput({
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
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
