import React, { useState } from 'react';
import { Icon } from './shared/icons';
import { PLANS } from './shared/constants';
import { auth } from '../firebase';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || '';

export default function UpgradeModal({ onClose, currentPlan = 'free' }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  const handleUpgrade = async (planId) => {
    if (planId === 'free' || planId === currentPlan) return;
    const user = auth.currentUser;
    if (!user) { setError('Trebuie sa fii autentificat.'); return; }
    setLoadingPlan(planId);
    setError('');
    try {
      const res = await fetch(`${SERVER_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, uid: user.uid, email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'A aparut o eroare. Incearca din nou.');
      }
    } catch {
      setError('Nu s-a putut conecta la server. Incearca din nou.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPlanStatus = (planId) => {
    if (planId === currentPlan) return 'current';
    const order = ['free', 'essential', 'premium'];
    if (order.indexOf(planId) < order.indexOf(currentPlan)) return 'downgrade';
    return 'upgrade';
  };

  const getCtaLabel = (plan) => {
    const status = getPlanStatus(plan.id);
    if (status === 'current') return 'Plan curent';
    if (status === 'downgrade') return 'Downgrade';
    return plan.cta;
  };

  const getCtaClass = (plan) => {
    const status = getPlanStatus(plan.id);
    if (status === 'current') return 'modal__plan-cta--ghost';
    if (status === 'downgrade') return 'modal__plan-cta--outline';
    if (plan.highlight) return 'modal__plan-cta--primary';
    return 'modal__plan-cta--outline';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">Alege planul tau</div>
          <div className="modal__sub">Fara contracte. Anulezi oricand.</div>
          <button className="modal__close" onClick={onClose}><Icon.Close /></button>
        </div>
        {error && <div className="modal__error">{error}</div>}
        <div className="modal__plans">
          {PLANS.map(p => {
            const status  = getPlanStatus(p.id);
            const loading = loadingPlan === p.id;
            return (
              <div
                key={p.id}
                className={[
                  'modal__plan',
                  p.highlight ? 'modal__plan--highlight' : '',
                  status === 'current' ? 'modal__plan--current' : '',
                ].join(' ')}
              >
                {p.highlight && status !== 'current' && <div className="modal__plan-badge">Recomandat</div>}
                {status === 'current' && <div className="modal__plan-badge modal__plan-badge--current">Activ</div>}
                <div className="modal__plan-name">{p.name}</div>
                <div className="modal__plan-price">
                  <span className="modal__plan-price-val">{p.price}</span>
                  <span className="modal__plan-price-per"> {p.period}</span>
                </div>
                <ul className="modal__plan-features">
                  {p.features.map(f => (
                    <li key={f}><span className="modal__plan-check"><Icon.Check /></span>{f}</li>
                  ))}
                </ul>
                <button
                  className={`modal__plan-cta ${getCtaClass(p)}`}
                  disabled={status === 'current' || status === 'downgrade' || loading}
                  onClick={() => handleUpgrade(p.id)}
                >
                  {loading ? <span className="auth-spinner" /> : getCtaLabel(p)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}