import { Footer } from "@/components/layouts/home/footer"
import { Header } from "@/components/layouts/home/header"

export const HomeLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="bg-noise">
      <Header />
      <main className="overflow-hidden pt-24 md:pt-36">{children}</main>
      <Footer />
    </div>
  )
}
