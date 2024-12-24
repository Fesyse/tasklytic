import { HomeLayout as Layout } from "@/components/layout/home"

export default function HomeLayout({ children }: React.PropsWithChildren) {
  return <Layout>{children}</Layout>
}
