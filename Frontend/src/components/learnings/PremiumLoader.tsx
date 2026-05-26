import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

export function PremiumLoader({ showText = false }: { showText?: boolean }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Fetch loading.json from public folder
    fetch('/loading.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  if (!animationData) {
    // Fallback loading while animation loads
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-[#8B4513]/20 border-t-[#8B4513] rounded-full animate-spin"></div>
        {showText && <span className="text-lg font-semibold text-[#8B4513]">Loading</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-32 h-32">
        <Lottie 
          animationData={animationData} 
          loop={true}
          autoplay={true}
        />
      </div>
      
      {showText && (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-[#8B4513]">Loading</span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-[#8B4513] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PremiumLoaderFullScreen({ showText = false }: { showText?: boolean }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <PremiumLoader showText={showText} />
    </div>
  );
}
