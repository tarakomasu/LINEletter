'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipContent = (
    <div
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="absolute -translate-x-1/2 -translate-y-[110%] p-2 text-sm text-white bg-gray-800 rounded-md z-50 shadow-lg whitespace-nowrap"
    >
      {content}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center"
      >
        {children}
      </div>
      {isMounted && isVisible && ReactDOM.createPortal(tooltipContent, document.body)}
    </>
  );
};

export default Tooltip;
