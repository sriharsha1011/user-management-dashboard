import { useEffect, useRef } from 'react';

// Observes a sentinel element and calls onIntersect when it scrolls into
// view. Used to trigger "load more" in infinite-scroll mode without any
// scroll event listeners.
export function useInfiniteScrollSentinel(onIntersect, { enabled = true } = {}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
