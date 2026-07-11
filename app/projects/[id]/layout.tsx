export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface pb-24">
      {children}
    </div>
  )
}
