/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next"
import "./src/env"

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
        hostname: "tasklytic.fesyse.site",
        protocol: "https",
        pathname: "/_next/**"
      },
      {
        hostname: "ik.imagekit.io",
        protocol: "https",
        pathname: "**"
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

export default config
