import React from 'react';
import { Icon } from './shared/icons';
import { getRank, RANKS, getNextRank, getRankIdx } from './shared/ranks';
import { RECENT_ACTIVITY, SUGGESTED_QUESTIONS } from './shared/constants';

function RankCard({ streak }) {
  const rank    = getRank(streak);
  const next    = getNextRank(streak);
  const curIdx  = getRankIdx(streak);
  const prevDays = RANKS[curIdx]?.days ?? 0;
  const pct     = next ? Math.min(100, Math.round(((streak - prevDays) / (next.days - prevDays)) * 100)) : 100;
  return (
    <div className="rank-card">
      <div className="rank-card__eyebrow">Grad curent</div>
      <div className="rank-card__name" style={{ color: rank.color }}>
        {rank.label}
        {rank.easter && <span className="rank-card__easter">Easter Egg</span>}
      </div>
      <div className="rank-card__streak">{streak} zile consecutive</div>
      {next && (
        <div className="rank-card__next">
          <div className="rank-card__next-row">
            <span>Spre {next.label}</span>
            <span>{next.days - streak} zile</span>
          </div>
          <div className="rank-card__bar">
            <div className="rank-card__bar-fill" style={{ width: `${pct}%`, background: next.color }} />
          </div>
        </div>
      )}
      <div className="rank-card__all">
        {RANKS.filter(r => !r.easter).map(r => (
          <div key={r.label} className={`rank-pip ${streak >= r.days ? 'rank-pip--done' : ''}`} style={{ '--pip-color': r.color }} title={r.label} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ setActiveNav, streak, onUpgrade }) {
  const rank = getRank(streak);
  return (
    <div className="dashboard-view">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card__label">Grile rezolvate</div>
          <div className="stat-card__value">48</div>
          <div className="stat-card__sub">+12 aceasta saptamana</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Rata corecte</div>
          <div className="stat-card__value">81%</div>
          <div className="stat-card__sub">Media pe 30 zile</div>
        </div>
        <div className="stat-card stat-card--accent">
          <div className="stat-card__label">Serie activa</div>
          <div className="stat-card__value">{streak} zile</div>
          <div className="stat-card__sub" style={{ color: rank.color }}>{rank.label}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Timp studiu</div>
          <div className="stat-card__value">3h 20m</div>
          <div className="stat-card__sub">Azi</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col dashboard-col--main">
          <div className="panel">
            <div className="panel__header">
              <div className="panel__title">Activitate recenta</div>
              <button className="panel__action" onClick={() => setActiveNav('grile')}>Incepe sesiune <Icon.Arrow /></button>
            </div>
            <div className="activity-list">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-item__info">
                    <div className="activity-item__label">{a.label}</div>
                    <div className="activity-item__time">{a.time}</div>
                  </div>
                  <div className="activity-item__right">
                    <div className="activity-item__score">{a.score}</div>
                    <div className="activity-item__bar"><div className="activity-item__bar-fill" style={{ width: `${a.pct}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel__header"><div className="panel__title">Progres pe materii</div></div>
            <div className="progress-list">
              {[
                { label: 'Drept Civil',       pct: 72, done: 86, total: 120 },
                { label: 'Procedura Civila',   pct: 55, done: 44, total: 80  },
                { label: 'Drept Penal',        pct: 90, done: 36, total: 40  },
                { label: 'Procedura Penala',   pct: 30, done: 18, total: 60  },
              ].map(m => (
                <div key={m.label} className="progress-item">
                  <div className="progress-item__top">
                    <span className="progress-item__label">{m.label}</span>
                    <span className="progress-item__pct">{m.pct}%</span>
                  </div>
                  <div className="progress-item__bar"><div className="progress-item__fill" style={{ width: `${m.pct}%` }} /></div>
                  <div className="progress-item__sub">{m.done} / {m.total} grile</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-col dashboard-col--side">
          <RankCard streak={streak} />
          <div className="panel panel--dark">
            <div className="panel__header">
              <div className="panel__title panel__title--light">Lumi AI</div>
              <button className="panel__action panel__action--light" onClick={() => setActiveNav('lumiAI')}>Deschide <Icon.Arrow /></button>
            </div>
            <p className="panel__desc">Pune o intrebare juridica si primeste un raspuns instant.</p>
            <div className="lumi-quick">
              {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                <button key={q} className="lumi-quick__chip" onClick={() => setActiveNav('lumiAI')}>{q}</button>
              ))}
            </div>
          </div>
          <div className="panel panel--upgrade">
            <div className="panel__upgrade-text">
              <div className="panel__upgrade-title">Upgrade plan</div>
              <div className="panel__upgrade-sub">Acces la grile nelimitate si Lumi AI</div>
            </div>
            <button className="panel__upgrade-btn" onClick={onUpgrade}>Vezi planuri</button>
          </div>
        </div>
      </div>
    </div>
  );
}