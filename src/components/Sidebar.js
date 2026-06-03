import React from 'react';
import { Icon } from './shared/icons';
import { NAV_ITEMS } from './shared/constants';
import { getRank } from './shared/ranks';

const NAV_ICON_MAP = { grid: Icon.Grid, book: Icon.Book, chat: Icon.Chat };

export default function Sidebar({ activeNav, setActiveNav, collapsed, setCollapsed, onLogout, user, streak, mobileOpen, setMobileOpen }) {
  const rank = getRank(streak);
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__top">
          <div className="sidebar__logo">
            <div className="sidebar__logo-mark">V</div>
            {!collapsed && <span className="sidebar__logo-text">VERÐIKT</span>}
            {!collapsed && (
              <button className="sidebar__collapse-btn" onClick={() => { setCollapsed(true); setMobileOpen(false); }} title="Restrânge">
                <Icon.Collapse />
              </button>
            )}
          </div>
          {collapsed && (
            <button className="sidebar__expand-btn" onClick={() => setCollapsed(false)} title="Extinde">
              <Icon.Expand />
            </button>
          )}
          <nav className="sidebar__nav">
            {NAV_ITEMS.map(item => {
              const IC = NAV_ICON_MAP[item.icon];
              return (
                <button
                  key={item.id}
                  className={`sidebar__nav-item ${activeNav === item.id ? 'sidebar__nav-item--active' : ''}`}
                  onClick={() => { setActiveNav(item.id); setMobileOpen(false); }}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar__nav-icon"><IC /></span>
                  {!collapsed && <span className="sidebar__nav-label">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar__bottom">
          <button
            className={`sidebar__nav-item ${activeNav === 'setari' ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => { setActiveNav('setari'); setMobileOpen(false); }}
            title={collapsed ? 'Setari' : undefined}
          >
            <span className="sidebar__nav-icon"><Icon.Settings /></span>
            {!collapsed && <span className="sidebar__nav-label">Setari</span>}
          </button>
          <button className="sidebar__nav-item sidebar__logout" onClick={onLogout} title={collapsed ? 'Deconectare' : undefined}>
            <span className="sidebar__nav-icon"><Icon.Logout /></span>
            {!collapsed && <span className="sidebar__nav-label">Deconectare</span>}
          </button>
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user?.displayName || 'Utilizator'}</div>
                <div className="sidebar__user-rank" style={{ color: rank.color }}>{rank.label}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}