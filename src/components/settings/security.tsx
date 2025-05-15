"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export function SettingsSecurity() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-medium">Email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">fesyse@mail.ru</p>
            </div>
            <Button variant="outline">Change email</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Password</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Change your password to login to your account.
              </p>
            </div>
            <Button variant="outline">Change password</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">2-step verification</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Add an additional layer of security to your account during login.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" disabled={!twoFactorEnabled}>
              Add verification method
            </Button>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Passkeys</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Securely sign-in with on-device biometric authentication.
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Use your fingerprint, face recognition, or screen lock to sign in
              to your account.
            </p>
          </div>
          <Button variant="outline">Add passkey</Button>
        </div>
      </div>
    </div>
  )
}
