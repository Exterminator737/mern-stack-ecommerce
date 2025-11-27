import React, { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-40 h-10 w-10 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
