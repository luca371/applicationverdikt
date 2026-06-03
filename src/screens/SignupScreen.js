import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './SignupScreen.css';

const provider = new GoogleAuthProvider();
const STEPS = ['Cont', 'Profil', 'Detalii'];

const FACULTATI = [
  'Facultatea de Drept, Bucuresti',
  'Facultatea de Drept, Cluj-Napoca',
  'Facultatea de Drept, Iasi',
  'Facultatea de Drept, Timisoara',
  'Facultatea de Drept, Craiova',
  'Alta institutie',
];
const ANI_STUDIU = ['Anul I', 'Anul II', 'Anul III', 'Masterat', 'Doctorat', 'Absolvent'];

export default function SignupScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromGoogle  = !!location.state?.fromGoogle;
  const googleEmail = location.state?.email || '';

  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showPassC, setShowPassC] = useState(false);

  const [form, setForm] = useState({
    email: googleEmail,
    password: '', passwordConfirm: '',
    nume: '', prenume: '', varsta: '',
    facultate: '', anStudiu: '',
  });

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const validateStep = () => {
    if (step === 0) {
      if (!fromGoogle) {
        if (!form.email || !form.password || !form.passwordConfirm) return 'Completeaza toate campurile.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Adresa de email invalida.';
        if (form.password.length < 6) return 'Parola trebuie sa aiba cel putin 6 caractere.';
        if (form.password !== form.passwordConfirm) return 'Parolele nu coincid.';
      } else {
        if (!form.email) return 'Emailul lipseste.';
      }
    }
    if (step === 1) {
      if (!form.nume || !form.prenume || !form.varsta) return 'Completeaza toate campurile.';
      const age = parseInt(form.varsta, 10);
      if (isNaN(age) || age < 16 || age > 80) return 'Varsta trebuie sa fie intre 16 si 80 de ani.';
    }
    if (step === 2) {
      if (!form.facultate || !form.anStudiu) return 'Completeaza toate campurile.';
    }
    return null;
  };

  const handleNext = () => { const err = validateStep(); if (err) { setError(err); return; } setStep(s => s + 1); setError(''); };
  const handleBack = () => { setStep(s => s - 1); setError(''); };

  const saveProfile = async (uid, displayName, email) => {
    const today     = new Date().toISOString().slice(0, 10);
    const d         = new Date();
    const thisMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    await setDoc(doc(db, 'users', uid), {
      nume:            form.nume,
      prenume:         form.prenume,
      varsta:          parseInt(form.varsta, 10),
      facultate:       form.facultate,
      anStudiu:        form.anStudiu,
      email,
      displayName,
      plan:            'free',
      planUpdatedAt:   serverTimestamp(),
      grileAzi:        0,
      grileData:       today,
      lumiAceastaLuna: 0,
      lunaStart:       thisMonth,
      createdAt:       serverTimestamp(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const displayName = `${form.prenume} ${form.nume}`;
      if (fromGoogle) {
        const user = auth.currentUser;
        await updateProfile(user, { displayName });
        await saveProfile(user.uid, displayName, user.email);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(user, { displayName });
        await saveProfile(user.uid, displayName, form.email);
      }
      navigate('/start');
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Exista deja un cont cu acest email.',
        'auth/invalid-email':        'Email invalid.',
        'auth/weak-password':        'Parola este prea slaba.',
      };
      setError(msgs[err.code] || 'A aparut o eroare. Incearca din nou.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await signInWithPopup(auth, provider); navigate('/start'); }
    catch { setError('Autentificarea cu Google a esuat.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="signup-page">
      <div className="signup-panel">
        <div className="signup-panel__content">
          <Link to="/" className="signup-panel__logo">
            <div className="signup-panel__logo-mark">V</div>
            <span className="signup-panel__logo-text">VERÐIKT</span>
          </Link>
          <div className="signup-panel__steps">
            <p className="signup-panel__steps-label">Pasi de inregistrare</p>
            {STEPS.map((label, i) => (
              <div key={label} className={`signup-step-item ${i === step ? 'signup-step-item--active' : ''} ${i < step ? 'signup-step-item--done' : ''}`}>
                <div className="signup-step-item__num">{i < step ? '✓' : i + 1}</div>
                <div>
                  <div className="signup-step-item__label">{label}</div>
                  <div className="signup-step-item__desc">{['Email si parola', 'Nume, prenume, varsta', 'Facultate si interese'][i]}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="signup-panel__bottom">
            <p className="signup-panel__already">Ai deja cont? <Link to="/login" className="signup-panel__link">Autentifica-te</Link></p>
          </div>
        </div>
      </div>

      <div className="signup-form-side">
        <div className="signup-form-card">
          <div className="signup-progress">
            <div className="signup-progress__fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="signup-form-card__header">
            <div className="signup-step-badge">Pasul {step + 1} din {STEPS.length}</div>
            <h1 className="signup-form-card__title">{['Creeaza-ti contul', 'Spune-ne despre tine', 'Aproape gata'][step]}</h1>
            <p className="signup-form-card__sub">{['Completeaza datele de autentificare.', 'Informatii personale de baza.', 'Personalizeaza-ti experienta.'][step]}</p>
          </div>

          {step === 0 && !fromGoogle && (
            <>
              <button className="btn-google" onClick={handleGoogle} disabled={loading}>
                <svg viewBox="0 0 24 24" width="17" height="17">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continua cu Google
              </button>
              <div className="auth-divider"><span>sau</span></div>
            </>
          )}

          {step === 0 && fromGoogle && (
            <div className="auth-google-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0', color: '#000' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Autentificat cu Google ca <strong>{googleEmail}</strong>
            </div>
          )}

          <form className="signup-form" onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {step === 0 && (
              <div className="signup-fields" key="step0">
                <div className="auth-field">
                  <label className="auth-field__label">Email</label>
                  <div className="auth-field__wrap">
                    <input
                      className="auth-field__input" type="email" name="email"
                      placeholder="email@exemplu.ro" value={form.email}
                      onChange={handleChange} autoComplete="email"
                      readOnly={fromGoogle}
                      style={fromGoogle ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    />
                  </div>
                </div>
                {!fromGoogle && (
                  <>
                    <div className="auth-field">
                      <label className="auth-field__label">Parola</label>
                      <div className="auth-field__wrap">
                        <input className="auth-field__input" type={showPass ? 'text' : 'password'} name="password" placeholder="Minim 6 caractere" value={form.password} onChange={handleChange} autoComplete="new-password" />
                        <button type="button" className="auth-field__eye" onClick={() => setShowPass(!showPass)}>{showPass ? 'Ascunde' : 'Arata'}</button>
                      </div>
                      <div className="signup-pass-strength">
                        {[1,2,3,4].map(i => <div key={i} className={`signup-pass-bar ${form.password.length >= i * 2 ? 'signup-pass-bar--fill' : ''}`} />)}
                        <span className="signup-pass-label">{form.password.length === 0 ? '' : form.password.length < 6 ? 'Slaba' : form.password.length < 10 ? 'Medie' : 'Puternica'}</span>
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-field__label">Confirma parola</label>
                      <div className="auth-field__wrap">
                        <input className="auth-field__input" type={showPassC ? 'text' : 'password'} name="passwordConfirm" placeholder="Repeta parola" value={form.passwordConfirm} onChange={handleChange} autoComplete="new-password" />
                        <button type="button" className="auth-field__eye" onClick={() => setShowPassC(!showPassC)}>{showPassC ? 'Ascunde' : 'Arata'}</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="signup-fields" key="step1">
                <div className="signup-row">
                  <div className="auth-field">
                    <label className="auth-field__label">Nume</label>
                    <div className="auth-field__wrap">
                      <input className="auth-field__input" type="text" name="nume" placeholder="ex: Sumudica" value={form.nume} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-field__label">Prenume</label>
                    <div className="auth-field__wrap">
                      <input className="auth-field__input" type="text" name="prenume" placeholder="ex: George" value={form.prenume} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-field__label">Varsta</label>
                  <div className="auth-field__wrap">
                    <input className="auth-field__input" type="number" name="varsta" placeholder="ex: 22" value={form.varsta} onChange={handleChange} min="16" max="80" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="signup-fields" key="step2">
                <div className="auth-field">
                  <label className="auth-field__label">Facultate</label>
                  <div className="auth-field__wrap auth-field__wrap--select">
                    <select className="auth-field__input auth-field__select" name="facultate" value={form.facultate} onChange={handleChange}>
                      <option value="">Selecteaza facultatea</option>
                      {FACULTATI.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-field__label">An de studiu</label>
                  <div className="auth-field__wrap auth-field__wrap--select">
                    <select className="auth-field__input auth-field__select" name="anStudiu" value={form.anStudiu} onChange={handleChange}>
                      <option value="">Selecteaza anul</option>
                      {ANI_STUDIU.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <div className="signup-form__actions">
              {step > 0 && <button type="button" className="btn-back" onClick={handleBack} disabled={loading}>Inapoi</button>}
              <button className="btn-auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : step < 2 ? 'Continua' : 'Creeaza contul'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}