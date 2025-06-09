"use server"

import { LOCALE_COOKIE_NAME } from "@/lib/locale"
import { cookies } from "next/headers"

export async function getUserLocale() {
  return (await cookies()).get(LOCALE_COOKIE_NAME)
}

export async function setUserLocale(locale: string) {
  ;(await cookies()).set(LOCALE_COOKIE_NAME, locale)
}
