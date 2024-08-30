/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/
import { IconLayoutNavbarCollapse } from "@tabler/icons-react"
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { type Menu, type Submenu } from "@/lib/menu-list"
import { cn } from "@/lib/utils"

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName
}: {
  items: Menu[]
  desktopClassName?: string
  mobileClassName?: string
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
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
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 dark:bg-neutral-900 min-[500px]:flex",
        className
      )}
    >
      {items.map(item => (
        <IconContainer mouseX={mouseX} key={item.label} {...item} />
      ))}
    </motion.div>
  )
}

type IconContainerProps = {
  mouseX: MotionValue
  label: string
  icon: LucideIcon
  submenus: Submenu[] // Added submenus here
} & ({ href: string } | { action: React.MouseEventHandler<HTMLButtonElement> })

function IconContainer({
  mouseX,
  label,
  icon: Icon,
  submenus, // Destructure submenus
  ...rest
}: IconContainerProps) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, val => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  )
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  )

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  })
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  })

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  })
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  })

  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="absolute -top-8 left-1/2 w-fit -translate-x-1/2 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        <Icon />
      </motion.div>
      {hovered && submenus.length > 0 && (
        <SubmenuContainer submenus={submenus} height={height} width={width} />
      )}
      {/* fixes user cant click on submenu */}
      <div className="absolute bottom-full left-1/2 hidden h-10 w-12 -translate-x-1/2 min-[500px]:block" />
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
  height: MotionValue<number>
}

const SubmenuContainer = ({
  submenus,
  height,
  width
}: SubmenuContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute bottom-[calc(100%+2.5rem)] left-1/2 flex translate-x-[-50%] flex-col-reverse gap-2" // Adjusted position
    >
      {submenus.map((submenu, idx) => (
        <motion.div
          key={submenu.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: idx * 0.1 }}
          style={{ width, height }} // Ensure same width and height as parent
        >
          {"href" in submenu ? (
            <Link
              href={submenu.href}
              className="flex h-full w-full items-center justify-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              <submenu.icon className="text-xl" />
            </Link>
          ) : (
            <button
              onClick={submenu.action}
              className="flex h-full w-full items-center justify-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              <submenu.icon className="text-xl" />
            </button>
          )}
        </motion.div>
      ))}
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
  const [hoveredItem, setHoveredItem] = useState<Menu | null>(null)

  return (
    <div className={cn("relative block min-[500px]:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
              >
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
                      href={
                        hoveredItem === item && item.submenus.length > 0
                          ? "#"
                          : item.href
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
                    >
                      <item.icon size={20} />
                    </Link>
                  ) : (
                    <Button
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
                      onClick={
                        hoveredItem === item && item.submenus.length > 0
                          ? undefined
                          : item.action
                      }
                    >
                      <item.icon size={20} />
                    </Button>
                  )}
                </motion.div>
                {hoveredItem === item && item.submenus.length > 0 && (
                  <SubmenuContainerMobile submenus={item.submenus} />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-900"
            >
              <submenu.icon className="text-sm" size={16} />
            </Link>
          ) : (
            <button
              onClick={submenu.action}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-900"
            >
              <submenu.icon className="text-sm" size={16} />
            </button>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
