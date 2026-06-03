import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { FACULTATI, ANI_STUDIU } from './shared/constants';
import { RANKS, getRank, getNextRank, getRankIdx } from './shared/ranks';

export default function Settings({ user, onUpgrade, currentPlan = 'free', streak = 0 }) {
  const [profile, setProfile] = useState({ nume: '', prenume: '', varsta: '', facultate: '', anStudiu: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setProfile({ nume: d.nume || '', prenume: d.prenume || '', varsta: String(d.varsta || ''), facultate: d.facultate || '', anStudiu: d.anStudiu || '' });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleChange = e => { setProfile({ ...profile, [e.target.name]: e.target.value }); setSaved(false); setError(''); };

  const handleSave = async e => {
    e.preventDefault();
    if (!profile.nume || !profile.prenume) { setError('Numele si prenumele sunt obligatorii.'); return; }
    const age = parseInt(profile.varsta, 10);
    if (isNaN(age) || age < 16 || age > 80) { setError('Varsta trebuie sa fie intre 16 si 80 de ani.'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { ...profile, varsta: age, email: user.email, updatedAt: serverTimestamp() }, { merge: true });
      await updateProfile(user, { displayName: `${profile.prenume} ${profile.nume}` });
      setSaved(true);
    } catch { setError('Eroare la salvare. Incearca din nou.'); }
    finally { setSaving(false); }
  };

  const planLabels = { free: 'Free', essential: 'Essential', premium: 'Premium' };
  const planDescs  = {
    free:      '10 grile / zi · Fara Lumi AI',
    essential: 'Grile nelimitate · 30 intrebari Lumi AI / luna',
    premium:   'Grile nelimitate · 100 intrebari Lumi AI / luna',
  };

  const currentRank = getRank(streak);
  const nextRank    = getNextRank(streak);
  const curIdx      = getRankIdx(streak);
  const prevDays    = RANKS[curIdx]?.days ?? 0;
  const pct         = nextRank
    ? Math.min(100, Math.round(((streak - prevDays) / (nextRank.days - prevDays)) * 100))
    : 100;

  if (loading) return <div className="setari-loading">Se incarca profilul...</div>;

  return (
    <div className="setari-view">
      <div className="setari-grid">

        {/* ── MAIN ── */}
        <div className="setari-main">
          <div className="panel">
            <div className="panel__header"><div className="panel__title">Informatii personale</div></div>
            <form className="setari-form" onSubmit={handleSave}>
              <div className="setari-section-label">Date personale</div>
              <div className="setari-row">
                <div className="setari-field">
                  <label className="setari-field__label">Nume</label>
                  <input className="setari-field__input" type="text" name="nume" value={profile.nume} onChange={handleChange} placeholder="ex: Ionescu" />
                </div>
                <div className="setari-field">
                  <label className="setari-field__label">Prenume</label>
                  <input className="setari-field__input" type="text" name="prenume" value={profile.prenume} onChange={handleChange} placeholder="ex: Alexandru" />
                </div>
              </div>
              <div className="setari-field">
                <label className="setari-field__label">Varsta</label>
                <input className="setari-field__input setari-field__input--short" type="number" name="varsta" value={profile.varsta} onChange={handleChange} placeholder="ex: 22" min="16" max="80" />
              </div>
              <div className="setari-section-label" style={{ marginTop: 24 }}>Date academice</div>
              <div className="setari-field">
                <label className="setari-field__label">Facultate</label>
                <div className="setari-select-wrap">
                  <select className="setari-field__input setari-field__select" name="facultate" value={profile.facultate} onChange={handleChange}>
                    <option value="">Selecteaza facultatea</option>
                    {FACULTATI.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="setari-field">
                <label className="setari-field__label">An de studiu</label>
                <div className="setari-select-wrap">
                  <select className="setari-field__input setari-field__select" name="anStudiu" value={profile.anStudiu} onChange={handleChange}>
                    <option value="">Selecteaza anul</option>
                    {ANI_STUDIU.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              {error && <div className="setari-error">{error}</div>}
              <div className="setari-actions">
                {saved && <span className="setari-saved">Salvat cu succes</span>}
                <button className="setari-save-btn" type="submit" disabled={saving}>{saving ? 'Se salveaza...' : 'Salveaza modificarile'}</button>
              </div>
            </form>
          </div>

        </div>

        {/* ── SIDE ── */}
        <div className="setari-side">
          <div className="panel">
            <div className="panel__header"><div className="panel__title">Contul tau</div></div>
            <div className="setari-account">
              <div className="setari-account__avatar">{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</div>
              <div className="setari-account__name">{user?.displayName || '—'}</div>
              <div className="setari-account__email">{user?.email}</div>
            </div>
          </div>
          <div className="panel">
            <div className="panel__header"><div className="panel__title">Abonament</div></div>
            <div className="setari-plan">
              <div className="setari-plan__name">{planLabels[currentPlan]}</div>
              <div className="setari-plan__desc">{planDescs[currentPlan]}</div>
              {currentPlan === 'free' && (
                <button className="setari-plan__upgrade" onClick={onUpgrade}>Upgrade plan</button>
              )}
              {currentPlan !== 'free' && (
                <div className="setari-plan__active">Plan activ ✓</div>
              )}
            </div>
          </div>
        </div>

        {/* ── GRADE ── */}
        <div className="setari-side">
          <div className="panel">
            <div className="panel__header">
              <div className="panel__title">Sistemul de grade</div>
            </div>
            <div className="setari-ranks">
              <div className="setari-rank-current">
                <div className="setari-rank-current__left">
                  <div className="setari-rank-current__label">Gradul tau actual</div>
                  <div className="setari-rank-current__name" style={{ color: currentRank.color }}>
                    {currentRank.label}
                    {currentRank.easter && <span className="rank-card__easter">Easter Egg</span>}
                  </div>
                  <div className="setari-rank-current__streak">{streak} zile consecutive</div>
                </div>
                {nextRank && (
                  <div className="setari-rank-current__progress">
                    <div className="setari-rank-current__progress-row">
                      <span>Spre {nextRank.label}</span>
                      <span>{nextRank.days - streak} zile</span>
                    </div>
                    <div className="setari-rank-current__bar">
                      <div className="setari-rank-current__bar-fill" style={{ width: `${pct}%`, background: nextRank.color }} />
                    </div>
                  </div>
                )}
                {!nextRank && (
                  <div className="setari-rank-current__max">Grad maxim atins 🏆</div>
                )}
              </div>
              <div className="setari-rank-list">
                {RANKS.map((r) => {
                  const isActive   = currentRank.label === r.label;
                  const isUnlocked = streak >= r.days;
                  return (
                    <div key={r.label} className={`setari-rank-item ${isActive ? 'setari-rank-item--active' : ''} ${isUnlocked ? 'setari-rank-item--unlocked' : ''}`}>
                      <div className="setari-rank-item__dot" style={{ background: isUnlocked ? r.color : 'var(--border)' }} />
                      <div className="setari-rank-item__info">
                        <div className="setari-rank-item__name" style={{ color: isUnlocked ? r.color : 'var(--ink-4)' }}>
                          {r.label}
                          {r.easter && <span className="setari-rank-item__easter">?</span>}
                          {isActive && <span className="setari-rank-item__badge">Activ</span>}
                        </div>
                        <div className="setari-rank-item__req">
                          {r.days === 0 ? 'De la inceput' : `${r.days} zile consecutive`}
                        </div>
                      </div>
                      {isUnlocked && !isActive && <div className="setari-rank-item__check">✓</div>}
                      {!isUnlocked && <div className="setari-rank-item__locked">{r.days - streak}z</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}