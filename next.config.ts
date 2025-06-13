/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { env } from "./src/env"

const config: NextConfig = {
  redirects: async () => [
    {
      source: "/dashboard/calendar",
      destination: "/dashboard/calendar/month-view",
      permanent: true
    }
  ],
  images: {
    remotePatterns: [
      {
        hostname: `${env.UPLOADTHING_APP_ID}.ufs.sh`,
        protocol: "https",
        pathname: "/f/**"
      },
      {
        hostname: "ik.imagekit.io",
        protocol: "https",
        pathname: "/lrigu76hy/tailark/night-background.jpg"
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(config)
