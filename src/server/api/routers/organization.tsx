import { tryCatch } from "@/lib/utils"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { auth, inviteMember } from "@/server/auth"
import { headers as nextHeaders } from "next/headers"
import { z } from "zod"

export const organizationRouter = createTRPCRouter({
  invitePeople: protectedProcedure
    .input(
      z.object({
        emails: z.array(z.string())
      })
    )
    .mutation(async ({ input }) => {
      const headers = await nextHeaders()
      const activeOrganization = await auth.api.getFullOrganization({
        headers
      })

      if (!activeOrganization) {
        throw new Error(
          "An error occured, while getting current organization, please try again later."
        )
      }

      const invitationPromises = input.emails.map((email) => {
        const invitationPromise = inviteMember(
          {
            email,
            role: "member"
          },
          headers
        )

        return invitationPromise
      })

      const { data: result, error: resultError } = await tryCatch(
        Promise.allSettled(invitationPromises)
      )

      if (resultError) {
        throw new Error(auth.$ERROR_CODES.FAILED_TO_RETRIEVE_INVITATION)
      }
      try {
        const errors = result.map((val) => {
          if (val.status === "fulfilled") return

          return val.reason.message
        })
        if (errors.length) {
          const error = new Error(
            errors
              .map((error, i) =>
                error
                  ? `Failed to invite "${input.emails[i]}", reason: ${error}`
                  : ""
              )
              .join(",\n")
          )

          throw error
        }

        return result
          .filter((res) => res.status === "fulfilled")
          .map((res) => res.value)
      } catch (err) {
        console.log(err)
        throw err
      }
    })
})
