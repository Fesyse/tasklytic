import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function FeaturesSection() {
  const features = [
    {
      title: "Simple and Intuitive",
      description:
        "A task management tool that's easy to use and understand, with a focus on minimalism and effectiveness.",
      icon: <IconEaseInOut />
    },
    {
      title: "Project Management Templates",
      description:
        "Get started with pre-made templates for project management, including marketing campaigns, product development, and more.",
      icon: <IconRouteAltLeft />
    },
    {
      title: "Personal Productivity Checklists",
      description:
        "Boost your daily productivity with pre-made checklists for planning, morning routines, and preparing for time off.",
      icon: <IconHeart />
    },
    {
      title: "Task Management Made Easy",
      description:
        "Create tasks, break them down into subtasks, and set deadlines with ease. No unnecessary features, just what you need to get work done.",
      icon: <IconTerminal2 />
    },
    {
      title: "Integration with Popular Services",
      description:
        "Seamlessly integrate with your favorite services, including [list popular services].",
      icon: <IconCloud />
    },
    {
      title: "Affordable Pricing",
      description:
        "Get access to our premium features at an affordable price, with no credit card required.",
      icon: <IconCurrencyDollar />
    },
    {
      title: "24/7 Customer Support",
      description:
        "Our support team is available around the clock to help you with any questions or issues.",
      icon: <IconHelp />
    },
    {
      title: "Money-Back Guarantee",
      description:
        "If you're not satisfied with our tool, we'll refund your money. No questions asked.",
      icon: <IconAdjustmentsBolt />
    }
  ]
  return (
    <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 bg-grid-black/[0.02] sm:grid-cols-2 lg:grid-cols-4">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  )
}

const Feature = ({
  title,
  description,
  icon,
  index
}: {
  title: string
  description: string
  icon: React.ReactNode
  index: number
}) => {
  return (
    <div
      className={cn(
        "group/feature relative flex flex-col py-10 backdrop-blur-sm dark:border-neutral-800 lg:border-r",
        (index === 0 || index === 4) && "dark:border-neutral-800 lg:border-l",
        index < 4 && "dark:border-neutral-800 lg:border-b"
      )}
    >
      {index < 4 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
      )}
      {index >= 4 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800" />
      )}
      <div className="relative z-10 mb-4 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="relative z-10 mb-2 px-10 text-lg font-bold">
        <div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-blue-500 dark:bg-neutral-700" />
        <span className="inline-block text-neutral-800 transition duration-200 group-hover/feature:translate-x-2 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="relative z-10 max-w-xs px-10 text-sm text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
    </div>
  )
}
