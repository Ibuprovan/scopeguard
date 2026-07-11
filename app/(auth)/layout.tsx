export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-brand-dim opacity-30 blur-[120px] -top-[200px] -right-[100px]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-danger-dim opacity-30 blur-[120px] bottom-[20%] -left-[100px]" />
      </div>
      {children}
    </div>
  )
}
