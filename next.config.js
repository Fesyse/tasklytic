/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["lucide-react"],
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
      }
      // {
      //   hostname: "utfs.io",
      //   pathname: `/a/${env.UPLOADTHING_APP_ID}/**`
      // }
    ]
  }
}

export default config
