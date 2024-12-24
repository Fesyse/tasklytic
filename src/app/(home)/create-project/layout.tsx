export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      {children}
    </div>
  )
}
