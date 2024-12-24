export default function SignInLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-[calc(100vh-var(--dashboard-header-size))] max-w-full overflow-hidden !p-0 lg:grid lg:grid-cols-2">
      {children}
    </div>
  )
}
