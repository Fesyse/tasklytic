/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/
import { IconLayoutNavbarCollapse } from "@tabler/icons-react"
import { type LucideIcon } from "lucide-react"
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from "motion/react"
import Link from "next/link"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./tooltip"
import { type Menu, type Submenu } from "@/lib/sidebar"

const DEFAULT_MAGNIFICATION = 60
const DEFAULT_DISTANCE = 140

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName
}: {
  items: Menu[]
  desktopClassName?: string
  mobileClassName?: string
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return isDesktop ? (
    <FloatingDockDesktop items={items} className={desktopClassName} />
  ) : (
    <FloatingDockMobile items={items} className={mobileClassName} />
  )
}

const FloatingDockDesktop = ({
  items,
  className
}: {
  items: Menu[]
  className?: string
}) => {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={e => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto mt-8 flex h-[58px] w-max gap-2 rounded-xl border bg-background p-2",
        className
      )}
    >
      <TooltipProvider>
        {items.map(item => (
          <IconContainer mouseX={mouseX} key={item.label} {...item} />
        ))}
      </TooltipProvider>
    </motion.div>
  )
}

type IconContainerProps = {
  mouseX: MotionValue
  label: string
  icon: LucideIcon
  distance?: number
  magnification?: number
  submenus: Submenu[] // Added submenus here
} & ({ href: string } | { action: React.MouseEventHandler<HTMLButtonElement> })

function IconContainer({
  mouseX,
  label,
  icon: Icon,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  submenus, // Destructure submenus
  ...rest
}: IconContainerProps) {
  const ref = useRef<HTMLDivElement>(null)

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, magnification, 40]
  )

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  })

  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.div
      ref={ref}
      style={{ width }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex h-full items-center justify-center"
    >
      <Icon size={18} />
      <AnimatePresence>
        {hovered && submenus.length > 0 && (
          <SubmenuContainer submenus={submenus} width={width} />
        )}
      </AnimatePresence>
    </motion.div>
  )

  return "href" in rest ? (
    <Link href={rest.href}>{content}</Link>
  ) : (
    <button onClick={rest.action}>{content}</button>
  )
}

type SubmenuContainerProps = {
  submenus: Submenu[]
  width: MotionValue<number>
}

const SubmenuContainer = ({ submenus, width }: SubmenuContainerProps) => {
  return (
    <motion.div
      key="submenus"
      className="supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 absolute bottom-[calc(100%+0.5rem)] left-1/2 z-[51] flex w-full translate-x-[-50%] flex-col items-center gap-2 rounded-t-xl border border-b-0 bg-background p-2" // Adjusted position
      initial={{ height: 0, padding: 0 }}
      animate={{
        height: submenus.length * 60 + (submenus.length - 1) * 8
      }}
      exit={{ height: 0, padding: 0 }}
    >
      <TooltipProvider>
        {submenus.map((submenu, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <motion.div
                key={submenu.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: (idx + 1) * 0.1 }}
                style={{ width, height: width }} // Ensure same width as parent
                className="z-[52] flex items-center justify-center" // !!!!52!!!! swaaag
              >
                {"href" in submenu ? (
                  <Link
                    href={submenu.href}
                    className="flex w-full justify-center"
                  >
                    <submenu.icon size={18} className="text-xl" />
                  </Link>
                ) : (
                  <button
                    onClick={submenu.action}
                    className="flex w-full justify-center"
                  >
                    <submenu.icon size={18} className="text-xl" />
                  </button>
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left" align="end" alignOffset={2}>
              {submenu.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
      {/* <motion.div
        className="absolute left-0 z-[51] w-full rounded-t-xl border border-b-0 p-2 backdrop-blur-md"
        initial={{ height: 0 }}
        animate={{
          height: submenus.length * 60 + (submenus.length - 1) * 8
        }}
        exit={{ height: 0, transition: { delay: 0.5 } }}
      ></motion.div> */}
    </motion.div>
  )
}

const FloatingDockMobile = ({
  items,
  className
}: {
  items: Menu[]
  className?: string
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <div key={item.label} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      delay: idx * 0.05
                    }
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                >
                  {"href" in item ? (
                    <Link
                      href={item.href}
                      className="supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md"
                    >
                      <item.icon className="text-foreground/75" size={20} />
                    </Link>
                  ) : (
                    <Button
                      className="supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md"
                      onClick={item.action}
                    >
                      <item.icon className="text-foreground/75" size={20} />
                    </Button>
                  )}
                </motion.div>
                <SubmenuContainerMobile submenus={item.submenus} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto flex h-10 w-10 items-center justify-center rounded-xl border p-2 backdrop-blur-md"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-foreground/75" />
      </button>
    </div>
  )
}

const SubmenuContainerMobile = ({ submenus }: { submenus: Submenu[] }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute left-full top-1/2 ml-2 flex -translate-y-1/2 gap-2"
    >
      {submenus.map((submenu, idx) => (
        <motion.div
          key={submenu.label}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ delay: idx * 0.1 }}
        >
          {"href" in submenu ? (
            <Link
              href={submenu.href}
              className="supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md"
            >
              <submenu.icon className="text-sm" size={16} />
            </Link>
          ) : (
            <button
              onClick={submenu.action}
              className="supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md"
            >
              <submenu.icon className="text-sm" size={16} />
            </button>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
