"use client"

import { isCuid } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { type FC, useMemo } from "react"
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
import { ProjectBreadcrumb } from "@/components/layout/dashboard/header/project-breadcrumb"
import { title } from "@/lib/utils"

type HeaderBreadcrumbsProps = React.ComponentPropsWithoutRef<"ul">

export const HeaderBreadcrumbs: FC<HeaderBreadcrumbsProps> = ({
  className,
  ...props
}) => {
  const isDesktop = useMediaQuery("(min-width: 500px)")
  const pathname = usePathname()
  const splittedPathname = useMemo(() => pathname.split("/"), [pathname])

  const currentPage = splittedPathname[splittedPathname.length - 1]
  const previousPage = splittedPathname[splittedPathname.length - 2]
  const previousPagePath = useMemo(
    () => splittedPathname.slice(0, splittedPathname.length - 1).join("/"),
    [splittedPathname]
  )

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
        {currentPage && currentPage !== "projects" ? (
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
