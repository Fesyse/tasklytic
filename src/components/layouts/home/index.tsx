import { Footer } from "@/components/layouts/home/footer"
import { Header } from "@/components/layouts/home/header"

export const HomeLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
