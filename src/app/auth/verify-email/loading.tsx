export default function VerifyEmailLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-md"></div>
        <div className="bg-muted h-12 w-4/5 animate-pulse rounded-md opacity-70"></div>
        <div className="bg-muted mt-3 h-10 w-32 animate-pulse rounded-md"></div>
      </div>
    </div>
  )
}
