import { ContentLayout } from "@/components/layout/content-layout"

export default function Layout({ children }: React.PropsWithChildren) {
	return <ContentLayout title="Create Project" className="flex justify-center items-center">{children}</ContentLayout>
}