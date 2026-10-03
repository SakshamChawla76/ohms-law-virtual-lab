import React from 'react';

export const AicosTopBar = ({ 
  onToggleSidebar, 
  searchQuery, 
  setSearchQuery, 
  onOpenSettings,
  onOpenHelp,
  title = "Interactive Labs" 
}) => {
  return (
    <header className="h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-200">
      {/* Left: Mobile hamburger & breadcrumb heading */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
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
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
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
            onClick={onOpenHelp}
            title="Lab Help Guide"
            className="p-2 text-on-surface-variant hover:text-teal-700 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Experiment & Simulation Settings"
            className="p-2 text-on-surface-variant hover:text-teal-700 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
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
