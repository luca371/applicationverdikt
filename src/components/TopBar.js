import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './shared/icons';
import { getRank } from './shared/ranks';

const NOTIFICATIONS = [
  {
    id: 1,
    from: 'Inspector',
    avatar: 'I',
    message: 'Sa ma iei de oua',
    time: 'Acum 2 min',
    unread: true,
  },
  {
    id: 2,
    from: 'Mihnea',
    avatar: 'M',
    message: 'Sa te vad dezbracat pe plaja',
    time: 'Acum 14 min',
    unread: true,
  },
];

export default function TopBar({ activeNav, streak, onMobileMenu }) {
  const titles  = { dashboard: 'Dashboard', grile: 'Grile', lumiAI: 'Lumi AI', setari: 'Setari' };
  const rank    = getRank(streak);
  const [open, setOpen]     = useState(false);
  const [read, setRead]     = useState(false);
  const dropdownRef = useRef(null);

  // Inchide la click afara
  useEffect(() => {
    const handler = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => { setOpen(o => !o); setRead(true); };

  return (
    <div className="topbar">
      <div className="topbar__left">
        <button className="topbar__mobile-menu" onClick={onMobileMenu}><Icon.Menu /></button>
        <div className="topbar__title">{titles[activeNav]}</div>
      </div>
      <div className="topbar__right">
        <div className="topbar__streak">
          <span className="topbar__streak-num">{streak}</span>
          <span className="topbar__streak-label" style={{ color: rank.color }}>{rank.label}</span>
        </div>

        <div className="notif-wrap" ref={dropdownRef}>
          <button className="topbar__icon-btn" onClick={handleOpen}>
            <Icon.Bell />
            {!read && <span className="topbar__notif-dot" />}
          </button>

          {open && (
            <div className="notif-dropdown">
              <div className="notif-dropdown__header">
                <span className="notif-dropdown__title">Notificari</span>
                <span className="notif-dropdown__count">{NOTIFICATIONS.length}</span>
              </div>
              <div className="notif-dropdown__list">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`notif-item ${!read ? 'notif-item--unread' : ''}`}>
                    <div className="notif-item__avatar">{n.avatar}</div>
                    <div className="notif-item__body">
                      <div className="notif-item__from">{n.from}</div>
                      <div className="notif-item__msg">{n.message}</div>
                      <div className="notif-item__time">{n.time}</div>
                    </div>
                    {!read && <div className="notif-item__dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}