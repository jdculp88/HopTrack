import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Once true, stop observing (fire once) */
  freezeOnceVisible?: boolean;
}

/**
 * Returns whether the target element is intersecting the viewport.
 * Use for lazy loading images, infinite scroll triggers, scroll-reveal animations.
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
 * return <div ref={ref}>{isIntersecting && <ExpensiveComponent />}</div>
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const frozen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (freezeOnceVisible && frozen.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsIntersecting(visible);
        if (visible && freezeOnceVisible) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return { ref, isIntersecting };
}
