import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Dashboard from '../components/Dashboard';
import Grile from '../components/Grile';
import Lumi from '../components/Lumi';
import Settings from '../components/Settings';
import UpgradeModal from '../components/UpgradeModal';

import './StartScreen.css';

export default function StartScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeNav, setActiveNav]         = useState('dashboard');
  const [collapsed, setCollapsed]         = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [showUpgrade, setShowUpgrade]     = useState(false);
  const [currentPlan, setCurrentPlan]     = useState('free');
  const [planLoading, setPlanLoading]     = useState(true);
  const [paymentBanner, setPaymentBanner] = useState(null);

  const user        = auth.currentUser;
  const streak      = 7; // TODO: fetch din Firestore
  const handledRef  = useRef(false); // evita dubla executie

  // Citeste planul din Firestore
  useEffect(() => {
    if (!user) { setPlanLoading(false); return; }
    getDoc(doc(db, 'users', user.uid))
      .then(snap => { if (snap.exists()) setCurrentPlan(snap.data().plan || 'free'); })
      .catch(() => setCurrentPlan('free'))
      .finally(() => setPlanLoading(false));
  }, [user]);

  // Detecteaza redirect de la Stripe si actualizeaza Firestore
  useEffect(() => {
    if (handledRef.current) return;
    const payment = searchParams.get('payment');
    const plan    = searchParams.get('plan');

    if (payment === 'success' && plan && user) {
      handledRef.current = true;
      updateDoc(doc(db, 'users', user.uid), {
        plan,
        planUpdatedAt: serverTimestamp(),
      }).then(() => {
        setCurrentPlan(plan);
        const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
        setPaymentBanner(`Felicitari! Ai activat planul ${planName} 🎉`);
        setTimeout(() => setPaymentBanner(null), 5000);
      }).catch(() => {
        setPaymentBanner('Plata a reusit! Reincarca pagina daca planul nu apare.');
        setTimeout(() => setPaymentBanner(null), 6000);
      });
      setSearchParams({});
    } else if (payment === 'cancelled') {
      handledRef.current = true;
      setPaymentBanner('Plata a fost anulata.');
      setSearchParams({});
      setTimeout(() => setPaymentBanner(null), 4000);
    }
  }, [searchParams, setSearchParams, user]);

  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  const views = {
    dashboard: <Dashboard setActiveNav={setActiveNav} streak={streak} onUpgrade={() => setShowUpgrade(true)} currentPlan={currentPlan} />,
    grile:     <Grile streak={streak} currentPlan={currentPlan} onUpgrade={() => setShowUpgrade(true)} />,
    lumiAI:    <Lumi currentPlan={currentPlan} onUpgrade={() => setShowUpgrade(true)} />,
    setari:    <Settings user={user} onUpgrade={() => setShowUpgrade(true)} currentPlan={currentPlan} streak={streak} />,
  };

  return (
    <div className="start-screen">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} currentPlan={currentPlan} />}

      {paymentBanner && (
        <div className={`payment-banner ${paymentBanner.includes('anulata') ? 'payment-banner--error' : 'payment-banner--success'}`}>
          {paymentBanner}
        </div>
      )}

      <Sidebar
        activeNav={activeNav} setActiveNav={setActiveNav}
        collapsed={collapsed} setCollapsed={setCollapsed}
        onLogout={handleLogout} user={user} streak={streak}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        currentPlan={currentPlan}
      />
      <div className="start-screen__main">
        <TopBar activeNav={activeNav} streak={streak} onMobileMenu={() => setMobileOpen(true)} currentPlan={currentPlan} />
        <div className="start-screen__content">
          {planLoading ? <div className="plan-loading">Se incarca...</div> : views[activeNav]}
        </div>
      </div>
    </div>
  );
}