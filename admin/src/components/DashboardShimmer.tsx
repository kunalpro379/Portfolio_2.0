export default function DashboardShimmer() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Welcome Banner Shimmer */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        <div className="h-4 bg-muted rounded w-32 mb-3"></div>
        <div className="h-8 bg-muted rounded w-72 mb-3"></div>
        <div className="h-4 bg-muted rounded w-96"></div>
      </div>

      {/* Stats Grid Shimmer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-muted rounded w-16"></div>
              <div className="w-9 h-9 bg-muted rounded-lg"></div>
            </div>
            <div className="h-8 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions Shimmer */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="h-6 bg-muted rounded w-36"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-background border border-border rounded-lg space-y-3">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="h-5 bg-muted rounded w-28"></div>
              <div className="h-3 bg-muted rounded w-36"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
