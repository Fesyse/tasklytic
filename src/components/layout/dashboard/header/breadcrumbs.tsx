"use client"

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
import { isUUID, title } from "@/lib/utils"

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
    .slice(0, splittedPathname.length - 2)
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
              {isUUID.safeParse(previousPage).success ? (
                <BreadcrumbLink href={previousPagePath} className="">
                  <ProjectBreadcrumb projectId={previousPage} />
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink href={previousPagePath}>
                  {title(previousPage)}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        ) : null}
        {currentPage ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="md:text-base lg:text-lg">
              {isUUID.safeParse(currentPage).success ||
              !isNaN(parseInt(currentPage)) ? (
                <BreadcrumbPage>
                  <ProjectBreadcrumb projectId={currentPage} />
                </BreadcrumbPage>
              ) : (
                <BreadcrumbPage className="">
                  {title(currentPage)}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}