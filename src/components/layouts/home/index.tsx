import { Footer } from "./home-footer"
import { Header } from "./home-header"

export const HomeLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
