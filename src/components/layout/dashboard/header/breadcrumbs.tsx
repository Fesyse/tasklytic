"use client"

import { isCuid } from "@paralleldrive/cuid2"
import { usePathname } from "next/navigation"
import { type FC } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { ProjectBreadcrumb } from "./project-breadcrumb"
import { title } from "@/lib/utils"

type HeaderBreadcrubmsProps = React.ComponentPropsWithoutRef<"ul">

export const HeaderBreadcrubms: FC<HeaderBreadcrubmsProps> = ({
  className,
  ...props
}) => {
  const isDesktop = useMediaQuery("(min-width: 500px)")
  const pathname = usePathname()
  const splittedPathname = pathname.split("/")

  const currentPage = splittedPathname[splittedPathname.length - 1]
  const previousPage = splittedPathname[splittedPathname.length - 2]
  const previousPagePath = splittedPathname
    .slice(0, splittedPathname.length - 1)
    .join("/")

  return (
    <Breadcrumb className={className} {...props}>
      <BreadcrumbList>
        <BreadcrumbItem className="md:text-base lg:text-lg">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {previousPage && isDesktop ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbEllipsis />
            <BreadcrumbSeparator />
            <BreadcrumbItem className="md:text-base lg:text-lg">
              <BreadcrumbLink
                href={previousPagePath}
                className="max-w-[75px] truncate"
              >
                {isCuid(previousPage) ? (
                  <ProjectBreadcrumb projectId={previousPage} />
                ) : (
                  title(previousPage)
                )}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
        {currentPage ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="md:text-base lg:text-lg">
              <BreadcrumbPage className="max-w-[75px] truncate">
                {isCuid(currentPage) || !isNaN(parseInt(currentPage)) ? (
                  <ProjectBreadcrumb projectId={currentPage} />
                ) : (
                  title(currentPage)
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
