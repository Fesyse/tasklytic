"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type GlowingStarsBackgroundCardProps = {
  className?: string
  children?: React.ReactNode
  glowingStarsOnHover?: number[]
}

export const GlowingStarsBackgroundCard = ({
  className,
  children,
  glowingStarsOnHover
}: GlowingStarsBackgroundCardProps) => {
  const [mouseEnter, setMouseEnter] = useState(false)

  return (
    <div
      onMouseEnter={() => {
        setMouseEnter(true)
      }}
      onMouseLeave={() => {
        setMouseEnter(false)
      }}
      className={cn(
        "h-full w-full rounded-xl border border-[#eaeaea] bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 dark:border-muted",
        className
      )}
    >
      <div className="flex items-center justify-center">
        <Illustration
          mouseEnter={mouseEnter}
          glowingStarsOnHover={glowingStarsOnHover}
        />
      </div>
      <div className="px-2 pb-6">{children}</div>
    </div>
  )
}

export const GlowingStarsDescription = ({
  className,
  children
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <p className={cn("max-w-[16rem] text-base text-white", className)}>
      {children}
    </p>
  )
}

export const GlowingStarsTitle = ({
  className,
  children
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <h2 className={cn("text-2xl font-bold text-[#eaeaea]", className)}>
      {children}
    </h2>
  )
}

export const Illustration = ({
  mouseEnter,
  glowingStarsOnHover
}: {
  mouseEnter: boolean
  glowingStarsOnHover: GlowingStarsBackgroundCardProps["glowingStarsOnHover"]
}) => {
  const stars = 114
  const columns = 17

  const [glowingStars, setGlowingStars] = useState<number[]>([])

  const highlightedStars = useRef<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      highlightedStars.current = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * stars)
      )
      setGlowingStars([...highlightedStars.current])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="h-48 w-full p-1"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `1px`
      }}
    >
      {[...Array<undefined>(stars)].map((_, starIdx) => {
        const isGlowing = glowingStars.includes(starIdx)
        const isGlowingStarOnHover = glowingStarsOnHover
          ? glowingStarsOnHover.includes(starIdx)
          : true
        const delay = (starIdx % 10) * 0.1
        const staticDelay = starIdx * 0.01

        return (
          <div
            key={`matrix-col-${starIdx}}`}
            className="relative flex items-center justify-center"
          >
            <Star
              isGlowing={mouseEnter ? isGlowingStarOnHover : isGlowing}
              delay={mouseEnter ? staticDelay : delay}
            />
            {(
              mouseEnter && glowingStarsOnHover ? isGlowingStarOnHover : false
            ) ? (
              <Glow delay={staticDelay} />
            ) : null}
            <AnimatePresence mode="wait">
              {(
                isGlowing && glowingStarsOnHover ? isGlowingStarOnHover : false
              ) ? (
                <Glow delay={delay} />
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

const Star = ({ isGlowing, delay }: { isGlowing: boolean; delay: number }) => {
  return (
    <motion.div
      key={delay}
      initial={{
        scale: 1
      }}
      animate={{
        scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
        background: isGlowing ? "#fff" : "#666"
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        delay: delay
      }}
      className={cn("relative z-20 h-[1px] w-[1px] rounded-full bg-[#666]")}
    ></motion.div>
  )
}

const Glow = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        delay: delay
      }}
      exit={{
        opacity: 0
      }}
      className="absolute left-1/2 z-10 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-blue-500 shadow-2xl shadow-blue-400 blur-[1px]"
    />
  )
}
