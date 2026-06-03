import React, { useState, useEffect } from 'react';
import { Icon } from './shared/icons';
import { ALL_GRILE, MATERII_FILTER } from './shared/constants';
import { getRank } from './shared/ranks';
import { useLimits } from '../hooks/useLimits';
import { auth } from '../firebase';

function Quiz({ grile, onAnswer }) {
  const [idx, setIdx]           = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  useEffect(() => { setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); }, [grile]);

  if (!grile.length) return <div className="quiz-empty">Nicio grila disponibila.</div>;

  const q = grile[idx];

  const pick = async i => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.corect) setScore(s => s + 1);
    await onAnswer(); // incrementeaza contorul
  };

  const next = () => {
    if (idx + 1 < grile.length) { setIdx(i => i + 1); setSelected(null); setAnswered(false); }
    else setDone(true);
  };

  const reset = () => { setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / grile.length) * 100);
    return (
      <div className="quiz-done">
        <div className="quiz-done__score">{score}<span>/{grile.length}</span></div>
        <p>{pct === 100 ? 'Impecabil!' : pct >= 75 ? 'Esti pe drumul cel bun!' : pct >= 50 ? 'Mai exerseaza.' : 'Continua sa inveti.'}</p>
        <button className="quiz-done__btn" onClick={reset}>Reincepe</button>
      </div>
    );
  }

  return (
    <div className="quick-quiz">
      <div className="quick-quiz__meta">
        <span className="quick-quiz__materie">{q.materie}</span>
        <span className="quick-quiz__counter">{idx + 1} / {grile.length}</span>
      </div>
      <div className="quick-quiz__progress">
        <div className="quick-quiz__progress-fill" style={{ width: `${(idx / grile.length) * 100}%` }} />
      </div>
      <p className="quick-quiz__question">{q.intrebare}</p>
      <div className="quick-quiz__options">
        {q.variante.map((v, i) => {
          let cls = 'quick-quiz__option';
          if (answered) { if (i === q.corect) cls += ' correct'; else if (i === selected) cls += ' wrong'; else cls += ' dim'; }
          else if (selected === i) cls += ' selected';
          return (
            <button key={i} className={cls} onClick={() => pick(i)}>
              <span className="quick-quiz__opt-letter">{String.fromCharCode(65 + i)}</span>{v}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quick-quiz__feedback">
          <span className="quick-quiz__feedback-icon"><Icon.Check /></span>
          <p>{q.explicatie}</p>
          <button className="quick-quiz__next" onClick={next}>
            {idx + 1 < grile.length ? 'Urmatoarea' : 'Rezultat'} <Icon.Arrow />
          </button>
        </div>
      )}
    </div>
  );
}

function GrileBlockate({ onUpgrade }) {
  return (
    <div className="quiz-blocked">
      <div className="quiz-blocked__icon"><Icon.Lock /></div>
      <div className="quiz-blocked__title">Limita zilnica atinsa</div>
      <p className="quiz-blocked__desc">Ai rezolvat cele 10 grile gratuite de azi. Revino maine sau upgradeaza pentru grile nelimitate.</p>
      <button className="quiz-blocked__btn" onClick={onUpgrade}>Vezi planuri</button>
    </div>
  );
}

export default function Grile({ streak, currentPlan, onUpgrade }) {
  const [activeM, setActiveM] = useState('Toate');
  const user     = auth.currentUser;
  const rank     = getRank(streak);
  const filtered = activeM === 'Toate' ? ALL_GRILE : ALL_GRILE.filter(g => g.materie === activeM);

  const {
    loading,
    grileAzi,
    grileRamase,
    grileBlockate,
    limits,
    incrementGrila,
  } = useLimits(user, currentPlan);

  return (
    <div className="grile-view">
      <div className="grile-view__filters">
        {MATERII_FILTER.map(m => (
          <button key={m} className={`filter-chip ${activeM === m ? 'filter-chip--active' : ''}`} onClick={() => setActiveM(m)}>{m}</button>
        ))}
      </div>
      <div className="grile-view__grid">
        <div className="grile-view__main">
          <div className="panel">
            <div className="panel__header">
              <div className="panel__title">
                {activeM === 'Toate' ? 'Toate grilele' : activeM} — {filtered.length} intrebari
              </div>
              {currentPlan === 'free' && !loading && (
                <div className="panel__limit-badge">
                  {grileBlockate
                    ? <span className="limit-badge limit-badge--red">Limita atinsa</span>
                    : <span className="limit-badge">{grileRamase} grile ramase azi</span>
                  }
                </div>
              )}
            </div>
            {loading
              ? <div className="quiz-loading">Se incarca...</div>
              : grileBlockate
                ? <GrileBlockate onUpgrade={onUpgrade} />
                : <Quiz grile={filtered} onAnswer={incrementGrila} />
            }
          </div>
        </div>

        <div className="grile-view__side">
          <div className="panel">
            <div className="panel__header"><div className="panel__title">Sesiunea ta</div></div>
            <div className="session-stats">
              {[
                { l: 'Disponibile', v: String(filtered.length) },
                { l: 'Materii',     v: activeM === 'Toate' ? '4' : '1' },
                { l: 'Timp / grila', v: '42s' },
              ].map(s => (
                <div key={s.l} className="session-stat">
                  <div className="session-stat__val">{s.v}</div>
                  <div className="session-stat__label">{s.l}</div>
                </div>
              ))}
            </div>
            {currentPlan === 'free' && !loading && (
              <div className="session-limit">
                <div className="session-limit__bar">
                  <div
                    className="session-limit__fill"
                    style={{ width: `${Math.min(100, (grileAzi / limits.grilePerZi) * 100)}%` }}
                  />
                </div>
                <div className="session-limit__label">{grileAzi} / {limits.grilePerZi} grile azi</div>
              </div>
            )}
          </div>
          <div className="panel">
            <div className="panel__header"><div className="panel__title">Grad curent</div></div>
            <div className="grade-mini">
              <div className="grade-mini__name" style={{ color: rank.color }}>{rank.label}</div>
              <div className="grade-mini__streak">{streak} zile consecutive</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}