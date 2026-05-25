export default function PageShimmer() {
  return (
    <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        {/* Header Shimmer */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 mb-3 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          <div className="h-5 w-96 bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>

        {/* Filter Tabs Shimmer */}
        <div className="bg-white/80 backdrop-blur-sm border border-premium-brown-200/50 p-2 mb-6 shadow-premium">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-12 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" 
                     style={{ animationDelay: `${i * 0.2}s` }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 border border-premium-brown-200/30 overflow-hidden shadow-premium">
              {/* Image Shimmer */}
              <div className="h-48 bg-gray-200 border-b border-premium-brown-200/30 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                     style={{ animationDelay: `${i * 0.3}s` }}></div>
              </div>
              
              {/* Content Shimmer */}
              <div className="p-6 space-y-4">
                {/* Badge */}
                <div className="h-4 w-16 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                       style={{ animationDelay: `${i * 0.3}s` }}></div>
                </div>
                
                {/* Title */}
                <div className="space-y-2">
                  <div className="h-6 w-full bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                  <div className="h-4 w-2/3 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-premium-brown-200/30">
                  <div className="h-4 w-32 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-10 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                  <div className="h-10 w-16 bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                         style={{ animationDelay: `${i * 0.3}s` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


