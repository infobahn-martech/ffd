import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

// Derived breakpoint thresholds — mirrors the $sm-479/767/991/1199 tokens in
// src/design/scss/partials/_variables.scss so JS-side width logic (Kanban
// column/card sizing, Header/SideNav) has one source of truth.
export const useBreakpoint = () => {
  const { width } = useWindowSize();

  return {
    width,
    isMobile: width <= 479,
    isLargeMobile: width > 479 && width <= 767,
    isTablet: width > 767 && width <= 991,
    isLaptop: width > 991 && width <= 1199,
    isDesktop: width > 1199,
  };
};

export default useWindowSize;
