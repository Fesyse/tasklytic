"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export function SettingsProfile() {
  const [username, setUsername] = useState("fesyse")
  const [supportAccess, setSupportAccess] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-medium">Profile Information</h3>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-4xl font-semibold text-white">
              <span>F</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Add photo
              </Button>
              <Button variant="ghost" size="sm">
                Create portrait
              </Button>
            </div>
          </div>
          <div className="flex-grow space-y-4">
            <div>
              <label
                htmlFor="preferred-name"
                className="mb-1 block text-sm font-medium"
              >
                Preferred name
              </label>
              <Input
                id="preferred-name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </div>
      </div>

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
        <h3 className="mb-4 text-lg font-medium">Support access</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Grant Notion support temporary access to your account
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Allow support to troubleshoot problems or recover content on your
              behalf. You can revoke access at any time.
            </p>
          </div>
          <Switch checked={supportAccess} onCheckedChange={setSupportAccess} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Delete my account</h3>
        <div>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:border-red-700 hover:bg-red-50 hover:text-red-700"
          >
            Delete my account
          </Button>
        </div>
      </div>
    </div>
  )
}
