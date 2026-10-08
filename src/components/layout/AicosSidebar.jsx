import React, { useState, useEffect, useRef } from 'react';
import anime from '../../lib/anime';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const AicosSidebar = ({ activeRoute = 'simulation-lab', onNavigate, isCollapsed, setIsCollapsed }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isSidebarCollapsed = isCollapsed !== undefined ? isCollapsed : collapsed;
  const sidebarRef = useRef(null);
  const navItemRefs = useRef([]);

  useEffect(() => {
    if (!sidebarRef.current) return;
    anime({
      targets: sidebarRef.current,
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 500,
      easing: 'easeOutExpo',
    });
  }, []);

  useEffect(() => {
    navItemRefs.current = navItemRefs.current.filter(Boolean);
    if (navItemRefs.current.length === 0) return;
    anime({
      targets: navItemRefs.current,
      opacity: [0, 1],
      translateX: [-8, 0],
      duration: 350,
      delay: anime.stagger(40),
      easing: 'easeOutExpo',
    });
  }, [isSidebarCollapsed]);

  const toggleCollapse = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!isSidebarCollapsed);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'subjects', label: 'My Subjects', icon: 'menu_book' },
    { id: 'assignments', label: 'Assignments', icon: 'assignment' },
    { id: 'submit', label: 'Submit Work', icon: 'upload_file' },
    { id: 'grades', label: 'Grades & Report Card', icon: 'description' },
    { id: 'paper-results', label: 'Paper Results', icon: 'assignment_turned_in' },
    { id: 'attendance', label: 'Attendance', icon: 'event_available' },
    { id: 'timetable', label: 'Timetable', icon: 'calendar_month' },
    { id: 'calendar', label: 'Academic Calendar', icon: 'event' },
    { id: 'simulation-lab', label: 'Interactive Labs', icon: 'science', isLab: true },
    { id: 'leave', label: 'Leave Portal', icon: 'event_busy' },
    { id: 'adapt', label: 'Carawin Adapt', icon: 'auto_graph' },
    { id: 'ai-tutor', label: 'AI Tutor', icon: 'psychology' },
    { id: 'shared-ai', label: 'Shared AI Content', icon: 'folder_shared' },
    { id: 'fees', label: 'Fees', icon: 'account_balance_wallet' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const handleCollapseButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.1 : 1,
      ...springSnappy,
    });
  };

  const handleNavItemHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.03 : 1,
      ...springFluid,
    });
  };

  const handleLogoutButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.03 : 1,
      ...springSnappy,
    });
  };

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-0 left-0 bottom-0 z-40 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header with Collapse Button & Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-outline-variant/20 flex-shrink-0">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-base shadow-sm flex-shrink-0">
              C
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-on-surface tracking-tight truncate">AICOS Portal</span>
              <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-widest truncate">Carawin Tech</span>
            </div>
          </div>
        )}

        <button
          onClick={toggleCollapse}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={(e) => handleCollapseButtonHover(e, true)}
          onMouseLeave={(e) => handleCollapseButtonHover(e, false)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant active:scale-95 transition-all duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="material-symbols-outlined text-xl">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* Student Profile Card (From Students.xlsx: Layla Richardson) */}
      <div className="p-3 border-b border-outline-variant/20 flex-shrink-0">
        <div
          className={`flex items-center rounded-xl p-2 transition-colors duration-200 hover:bg-surface-container/60 cursor-pointer ${
            isSidebarCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              LR
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="font-bold text-xs text-on-surface truncate">Layla Richardson</span>
              <span className="text-[11px] text-on-surface-variant font-medium truncate">Class 7 - D</span>
              <span className="text-[10px] text-teal-700 font-semibold tracking-wider truncate">ID: STU26036</span>
            </div>
          )}

          {!isSidebarCollapsed && (
            <span className="material-symbols-outlined text-sm text-on-surface-variant/60 flex-shrink-0">
              chevron_right
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
        {menuItems.map((item, idx) => {
          const isActive = item.id === activeRoute;
          return (
            <button
              key={item.id}
              ref={el => navItemRefs.current[idx] = el}
              onClick={() => onNavigate && onNavigate(item.id)}
              onMouseEnter={(e) => handleNavItemHover(e, true)}
              onMouseLeave={(e) => handleNavItemHover(e, false)}
              className={`w-full group relative flex items-center rounded-lg transition-all duration-200 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'text-teal-700 bg-teal-500/[0.12] font-bold border-r-2 border-teal-600'
                  : 'text-on-surface-variant hover:text-teal-700 hover:bg-surface-container/60'
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
                  isActive ? 'text-teal-600' : 'text-on-surface-variant group-hover:text-teal-600'
                }`}
              >
                {item.icon}
              </span>

              {!isSidebarCollapsed && (
                <span className="truncate tracking-tight flex-1 text-left">
                  {item.label}
                </span>
              )}

              {item.isLab && !isSidebarCollapsed && (
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Row at bottom */}
      <div className="p-3 border-t border-outline-variant/20 flex-shrink-0">
        <button
          onClick={() => {}}
          onMouseEnter={(e) => handleLogoutButtonHover(e, true)}
          onMouseLeave={(e) => handleLogoutButtonHover(e, false)}
          className={`w-full group flex items-center rounded-lg transition-all duration-200 text-sm font-semibold text-error hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40 ${
            isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'gap-3 px-3 py-2.5'
          }`}
          title={isSidebarCollapsed ? "Log Out" : undefined}
        >
          <span className="material-symbols-outlined text-[20px] flex-shrink-0">
            logout
          </span>
          {!isSidebarCollapsed && (
            <span className="truncate tracking-tight flex-1 text-left font-bold">
              Log Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};