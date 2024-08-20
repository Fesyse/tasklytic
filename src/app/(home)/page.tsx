import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type Item } from "@/components/ui/infinite-moving-cards"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

const features = [
  {
    title: "Task Management",
    description: "Create and manage tasks and subtasks effortlessly"
  },
  {
    title: "Project Creation",
    description: "Organize your work with multiple projects"
  },
  {
    title: "Task Delegation",
    description: "Assign tasks to team members easily"
  },
  {
    title: "Reminders",
    description: "Simple reminder system to keep you on track"
  },
  {
    title: "Minimalist Design",
    description: "Clean interface focused on productivity"
  },
  {
    title: "Deadlines",
    description: "Set and track deadlines for your tasks"
  }
]

const testimonials: Item[] = [
  {
    name: "Alice",
    title: "Freelancer",
    quote: "Tasklytic simplified my workflow. It's exactly what I needed!"
  },
  {
    name: "Bob",
    title: "Project Manager",
    quote: "The task delegation feature is a game-changer for our team."
  },
  {
    name: "Charlie",
    title: "Entrepreneur",
    quote: "Finally, a to-do app that doesn't overwhelm me with features."
  }
]
export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-size))]) dark:bg-grid-white/[0.02] rounded">
      <Spotlight className="dark:block hidden" fill="rgba(255,255,255,0.2)" />
      <section className="py-20 text-center">
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600">
          Tasklytic
        </h1>
        <TextGenerateEffect
          words="A simple and intuitive task management tool for individuals and small
          teams"
          duration={0.5}
          className="text-xl mb-8"
        />
        {/* <Button size="lg">Sign In</Button> */}
      </section>

      <section className="py-20 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl mb-8">
            Join Tasklytic today and streamline your task management
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-in">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
