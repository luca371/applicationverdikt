import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PLAN_LIMITS = {
  free:      { grilePerZi: 10,       lumiPerLuna: 0   },
  essential: { grilePerZi: Infinity, lumiPerLuna: 30  },
  premium:   { grilePerZi: Infinity, lumiPerLuna: 100 },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function thisMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // 'YYYY-MM'
}

export function useLimits(user, currentPlan) {
  const [grileAzi, setGrileAzi]           = useState(0);
  const [lumiAceastaLuna, setLumiAceastaLuna] = useState(0);
  const [loading, setLoading]             = useState(true);

  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

  // Citeste si reseteaza contoarele din Firestore
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const ref = doc(db, 'users', user.uid);
    getDoc(ref).then(async snap => {
      if (!snap.exists()) { setLoading(false); return; }
      const data = snap.data();

      const today     = todayStr();
      const thisMonth = thisMonthStr();
      const updates   = {};

      // Reset zilnic grile
      if (data.grileData !== today) {
        updates.grileAzi  = 0;
        updates.grileData = today;
      }

      // Reset lunar lumi
      if (data.lunaStart !== thisMonth) {
        updates.lumiAceastaLuna = 0;
        updates.lunaStart       = thisMonth;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(ref, updates);
        setGrileAzi(updates.grileAzi ?? data.grileAzi ?? 0);
        setLumiAceastaLuna(updates.lumiAceastaLuna ?? data.lumiAceastaLuna ?? 0);
      } else {
        setGrileAzi(data.grileAzi ?? 0);
        setLumiAceastaLuna(data.lumiAceastaLuna ?? 0);
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  // Incrementeaza grila rezolvata
  const incrementGrila = async () => {
    if (!user) return;
    const newVal = grileAzi + 1;
    setGrileAzi(newVal);
    await updateDoc(doc(db, 'users', user.uid), {
      grileAzi:  newVal,
      grileData: todayStr(),
    });
  };

  // Incrementeaza intrebare Lumi
  const incrementLumi = async () => {
    if (!user) return;
    const newVal = lumiAceastaLuna + 1;
    setLumiAceastaLuna(newVal);
    await updateDoc(doc(db, 'users', user.uid), {
      lumiAceastaLuna: newVal,
      lunaStart:       thisMonthStr(),
    });
  };

  const grileRamase    = Math.max(0, limits.grilePerZi - grileAzi);
  const lumiRamase     = Math.max(0, limits.lumiPerLuna - lumiAceastaLuna);
  const grileBlockate  = currentPlan === 'free' && grileAzi >= limits.grilePerZi;
  const lumiBlockate   = limits.lumiPerLuna !== Infinity && lumiAceastaLuna >= limits.lumiPerLuna;
  const lumiDisponibile = currentPlan !== 'free';

  return {
    loading,
    grileAzi,
    lumiAceastaLuna,
    grileRamase,
    lumiRamase,
    grileBlockate,
    lumiBlockate,
    lumiDisponibile,
    limits,
    incrementGrila,
    incrementLumi,
  };
}