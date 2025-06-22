export function Explore() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Explore</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Trending Topics</h2>
          <p className="text-muted-foreground">Discover what's popular in Space</p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">New Communities</h2>
          <p className="text-muted-foreground">Join exciting new groups</p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Suggested Users</h2>
          <p className="text-muted-foreground">Connect with like-minded people</p>
        </div>
      </div>
    </div>
  )
}
