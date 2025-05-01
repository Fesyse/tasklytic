import { tailwindConfig } from "@/styles/tailwind.config"
import { Button, Html, Tailwind } from "@react-email/components"

export default function OTPEmail() {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Button href="https://example.com">Click me</Button>
      </Html>
    </Tailwind>
  )
}
