import Image from "next/image"
import Link from "next/link"
import Balancer from "react-wrap-balancer"
import { OssChip } from "@/components/ui/oss-chips"
import { OssLight } from "@/components/ui/oss-lights"
import { HeroMainboardStuff } from "@/components/ui/shiny-lights"
import { Button } from "../ui/button"
import { siteConfig } from "@/config"

export const CTAWithGithub = () => {
  return (
    <div className="relative mx-auto flex flex-col items-center justify-center overflow-hidden py-20 text-gray-400 md:mt-14 md:px-8">
      <p className="mx-auto mt-8 max-w-2xl text-center font-recursive text-5xl font-normal tracking-tight text-gray-800 dark:text-gray-200">
        Proudly OpenSource.
      </p>
      <HeroMainboardStuff className="absolute top-[-100px] block brightness-50 invert dark:hidden" />
      <p className="mx-auto mt-4 max-w-xl text-center text-lg tracking-tight text-slate-400 relative z-50">
        <Balancer>
          Contribute, communicate and have fun with our team! We are always glad
          to help for you.
        </Balancer>
        <Button
          asChild
          variant="link"
          className="text-foreground/75 hover:text-foreground"
        >
          <Link href={siteConfig.github} target="_blank">
            {siteConfig.github}
          </Link>
        </Button>
      </p>
      <div className="relative flex flex-col items-center justify-center gap-6">
        <div className="absolute left-1/2 top-[-100px] -translate-x-1/2">
          <OssLight />
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <Image
          alt="Github logo"
          src="/github.svg"
          className="mt-24 hidden dark:block"
          width={640}
          height={520}
        />
        <div className="absolute left-[-50px] top-[150px] -z-50 lg:left-[150px] lg:top-[400px] lg:h-[400px] lg:w-[1000px]">
          <OssChip className="flex" />
        </div>
      </div>
    </div>
  )
}
