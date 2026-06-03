import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './LoginScreen.css';

const provider = new GoogleAuthProvider();

export default function LoginScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Completeaza toate campurile.'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate('/start');
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'Nu exista niciun cont cu acest email.',
        'auth/wrong-password': 'Parola incorecta.',
        'auth/invalid-email': 'Email invalid.',
        'auth/too-many-requests': 'Prea multe incercari. Incearca mai tarziu.',
        'auth/invalid-credential': 'Email sau parola incorecta.',
      };
      setError(msgs[err.code] || 'A aparut o eroare. Incearca din nou.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificam daca userul exista deja in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // User nou → trimitem la signup cu emailul precompletat
        navigate('/signup', { state: { email: user.email, fromGoogle: true } });
      } else {
        // User existent → mergem la app
        navigate('/start');
      }
    } catch (err) {
      const msgs = {
        'auth/popup-closed-by-user': 'Ai inchis fereastra Google.',
        'auth/popup-blocked': 'Popup-ul a fost blocat de browser.',
        'auth/unauthorized-domain': 'Domeniul nu este autorizat in Firebase.',
        'auth/operation-not-allowed': 'Google Sign-In nu este activat in Firebase.',
        'auth/cancelled-popup-request': 'Cererea a fost anulata.',
      };
      setError(msgs[err.code] || 'Autentificarea cu Google a esuat.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel__content">
          <Link to="/" className="auth-panel__logo">
            <div className="auth-panel__logo-mark">V</div>
            <span className="auth-panel__logo-text">VERÐIKT</span>
          </Link>
          <div className="auth-panel__quote">
            <p className="auth-panel__quote-text">
              "Iustitia est constans et perpetua voluntas ius suum cuique tribuendi."
            </p>
            <p className="auth-panel__quote-author">Iustinian I</p>
          </div>
          <div className="auth-panel__stats">
            {[{ v: '3.200+', l: 'Studenti activi' }, { v: '12k+', l: 'Grile rezolvate' }, { v: '98%', l: 'Promovabilitate' }].map(s => (
              <div key={s.l} className="auth-panel__stat">
                <span className="auth-panel__stat-v">{s.v}</span>
                <span className="auth-panel__stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <div className="auth-form-card__header">
            <h1 className="auth-form-card__title">Bun revenit</h1>
            <p className="auth-form-card__sub">
              Nu ai cont?{' '}
              <Link to="/signup" className="auth-link">Inregistreaza-te</Link>
            </p>
          </div>

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

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">Email</label>
              <div className="auth-field__wrap">
                <input className="auth-field__input" type="email" name="email"
                  placeholder="email@exemplu.ro" value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>
            <div className="auth-field">
              <div className="auth-field__label-row">
                <label className="auth-field__label">Parola</label>
                <button type="button" className="auth-forgot">Ai uitat parola?</button>
              </div>
              <div className="auth-field__wrap">
                <input className="auth-field__input" type={showPass ? 'text' : 'password'}
                  name="password" placeholder="Minim 6 caractere" value={form.password} onChange={handleChange} autoComplete="current-password" />
                <button type="button" className="auth-field__eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? 'Ascunde' : 'Arata'}
                </button>
              </div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Intra in cont'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}