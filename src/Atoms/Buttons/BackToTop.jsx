import React, { useState, useEffect } from "react";

function BackToTop() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const backToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <button
      onClick={backToTop}
      className={`
        fixed right-4 bottom-4 z-50
        bg-blue-600 hover:bg-blue-500
        w-10 h-10 rounded
        flex items-center justify-center
        transition-all duration-400 ease-in-out
        ${scroll > 100 ? "visible opacity-100" : "invisible opacity-0"}
      `}
    >
      <i className="bi bi-arrow-up-short text-white text-2xl leading-none"></i>
    </button>
  );
}

export default BackToTop;
