export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const response = await fetch("/api/turnstile", {
    method: "POST",
    body: JSON.stringify({ token })
  })

  const data = (await response.json()) as { success: boolean; message?: string }

  return data.success
}
