import { AnimatedGroup } from "@/components/ui/animated-group"
import { Button } from "@/components/ui/button"
import { SparklesText } from "@/components/ui/sparkles-text"
import { TextEffect } from "@/components/ui/text-effect"
import { siteConfig } from "@/lib/site-config"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5
      }
    }
  }
}

export function HeroSection() {
  const t = useTranslations("HomePage.HeroSection")

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        <div className="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>
      <section className="bg-noise">
        <div className="relative">
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    delayChildren: 1
                  }
                }
              },
              item: {
                hidden: {
                  opacity: 0,
                  y: 20
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    bounce: 0.3,
                    duration: 2
                  }
                }
              }
            }}
            className="absolute inset-0 -z-20"
          >
            <Image
              src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
              alt="background"
              className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
              width="3276"
              height="4095"
            />
          </AnimatedGroup>
          <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
          <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-36">
            <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
              <AnimatedGroup variants={transitionVariants}>
                <Link
                  href={siteConfig.announcementLink}
                  className="hover:bg-background dark:hover:border-t-border bg-muted group relative z-50 mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                >
                  <span className="text-foreground text-sm">
                    {t("announcement")}
                  </span>
                  <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                  <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedGroup>

              <h1 className="mt-8 text-4xl text-balance md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                <TextEffect preset="fade-in-blur" speedSegment={0.3} as="span">
                  {t("title")}
                </TextEffect>
                <SparklesText
                  withFadeIn
                  textEffectProps={{
                    preset: "fade-in-blur",
                    delay: 0.6,
                    speedSegment: 0.3
                  }}
                  text={siteConfig.name}
                  className="ml-3 text-4xl text-balance md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                />
              </h1>
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-8 max-w-2xl text-balance sm:text-lg"
              >
                {t("description")}
              </TextEffect>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75
                      }
                    }
                  },
                  ...transitionVariants
                }}
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
              >
                <div
                  key={1}
                  className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-5 text-base"
                  >
                    <Link href="/auth/sign-up">
                      <span className="text-nowrap">{t("start")}</span>
                    </Link>
                  </Button>
                </div>
                <Button
                  key={2}
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-10.5 rounded-xl px-5"
                >
                  <Link href="/pricing">
                    <span className="text-nowrap">{t("pricing")}</span>
                  </Link>
                </Button>
              </AnimatedGroup>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="to-background absolute inset-0 z-5 bg-linear-to-b from-transparent from-50%"
            />
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75
                    }
                  }
                },
                ...transitionVariants
              }}
            >
              <div className="mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
                <div className="ring-background bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg ring-1 inset-shadow-2xs shadow-zinc-950/15 dark:inset-shadow-white/20">
                  <Image
                    className="bg-background relative hidden aspect-15/8 rounded-2xl dark:block"
                    src="/mail2.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <Image
                    className="border-border/25 relative z-2 aspect-15/8 rounded-2xl border dark:hidden"
                    src="/mail2-light.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </div>
      </section>
    </>
  )
}
