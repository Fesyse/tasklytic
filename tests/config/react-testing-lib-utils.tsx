import { Providers } from "@/components/providers"
import { render, type RenderOptions } from "@testing-library/react"
import { type ReactElement } from "react"

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) =>
  render(ui, {
    wrapper: (props) => <Providers testing {...props} />,
    ...options
  })

export * from "@testing-library/react"
export { customRender as render }
