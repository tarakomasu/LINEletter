export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
