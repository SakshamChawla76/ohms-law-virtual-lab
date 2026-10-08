import React, { useEffect, useRef } from 'react';
import anime from '../../lib/anime';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const AicosTopBar = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  onOpenHelp,
  title = "Interactive Labs"
}) => {
  const mainRef = useRef(null);
  const searchRef = useRef(null);
  const actionRefs = useRef([]);

  useEffect(() => {
    if (!mainRef.current) return;
    anime({
      targets: mainRef.current,
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 500,
      easing: 'easeOutExpo',
    });
  }, []);

  useEffect(() => {
    if (!searchRef.current) return;
    anime({
      targets: searchRef.current,
      opacity: [0, 1],
      translateX: [-8, 0],
      duration: 400,
      delay: 200,
      easing: 'easeOutExpo',
    });
  }, []);

  useEffect(() => {
    actionRefs.current = actionRefs.current.filter(Boolean);
    if (actionRefs.current.length === 0) return;
    anime({
      targets: actionRefs.current,
      opacity: [0, 1],
      translateX: [8, 0],
      duration: 350,
      delay: anime.stagger(40),
      easing: 'easeOutExpo',
    });
  }, []);

  const handleHamburgerHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.1 : 1,
      ...springSnappy,
    });
  };

  const handleSearchFocus = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.02 : 1,
      borderColor: animate ? 'rgba(20, 184, 166, 0.5)' : 'rgba(21, 128, 114, 0.2)',
      boxShadow: animate ? '0 0 0 3px rgba(20, 184, 166, 0.1)' : 'none',
      ...springFluid,
    });
  };

  const handleActionButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.15 : 1,
      ...springSnappy,
    });
  };

  return (
    <header ref={mainRef} className="h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-200">
      {/* Left: Mobile hamburger & breadcrumb heading */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          onMouseEnter={(e) => handleHamburgerHover(e, true)}
          onMouseLeave={(e) => handleHamburgerHover(e, false)}
          className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
          title="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 uppercase tracking-widest hidden sm:inline-block">
            Student Portal
          </span>
          <span className="text-outline-variant hidden sm:inline-block">/</span>
          <h1 className="text-base sm:text-lg font-extrabold text-on-surface tracking-tight font-display">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Search pill bar */}
      <div ref={searchRef} className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="w-full flex items-center bg-surface-container rounded-full px-4 py-1.5 border border-outline-variant/30 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all duration-200">
          <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
            search
          </span>
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search experiments, laws, or topics (e.g. Ohm, Lens, Gas)..."
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery && setSearchQuery('')}
              className="text-on-surface-variant hover:text-on-surface ml-1"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick actions & Student Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenHelp && (
          <button
            ref={el => actionRefs.current[0] = el}
            onClick={onOpenHelp}
            onMouseEnter={(e) => handleActionButtonHover(e, true)}
            onMouseLeave={(e) => handleActionButtonHover(e, false)}
            title="Lab Help Guide"
            className="p-2 text-on-surface-variant hover:text-teal-700 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            ref={el => actionRefs.current[1] = el}
            onClick={onOpenSettings}
            onMouseEnter={(e) => handleActionButtonHover(e, true)}
            onMouseLeave={(e) => handleActionButtonHover(e, false)}
            title="Experiment & Simulation Settings"
            className="p-2 text-on-surface-variant hover:text-teal-700 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          ref={el => actionRefs.current[2] = el}
          onMouseEnter={(e) => handleActionButtonHover(e, true)}
          onMouseLeave={(e) => handleActionButtonHover(e, false)}
          className="relative p-2 text-on-surface-variant hover:text-teal-700 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>

        <div className="h-6 w-px bg-outline-variant/30 mx-1 hidden sm:block"></div>

        {/* Student Mini Avatar */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            LR
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-on-surface leading-tight">Layla Richardson</span>
            <span className="text-[10px] text-teal-700 font-semibold leading-tight">STU26036</span>
          </div>
        </div>
      </div>
    </header>
  );
};