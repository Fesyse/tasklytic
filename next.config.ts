import { NextConfig } from "next"
import "./src/env"

const config: NextConfig = {
  transpilePackages: ["lucide-react"],
  redirects: async () => [
    {
      source: "/dashboard",
      destination: "/projects",
      permanent: true
    }
  ],
  experimental: { reactCompiler: true, useCache: true },
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**"
      },
      {
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**"
      },
      {
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**"
      },
      {
        hostname: "utfs.io",
        pathname: "/f/*"
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default config
