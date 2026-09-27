import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LoadingAnimationProps {
  className?: string;
}

export default function LoadingAnimation({ className = 'w-24 h-24' }: LoadingAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let animation: any = null;
    let isCancelled = false;

    fetch('/loading.json')
      .then(res => res.json())
      .then(data => {
        if (isCancelled || !containerRef.current) return;
        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data
        });
      })
      .catch(err => console.error('Error loading animation:', err));

    return () => {
      isCancelled = true;
      if (animation) {
        animation.destroy();
      }
    };
  }, []);

  return <div ref={containerRef} className={`${className} scale-[3] origin-center overflow-visible`} aria-label="Loading animation" />;
}
