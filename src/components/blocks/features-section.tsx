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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
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
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800 backdrop-blur-sm",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  )
}
