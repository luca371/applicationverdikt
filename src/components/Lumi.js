import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './shared/icons';
import { SUGGESTED_QUESTIONS } from './shared/constants';
import { useLimits } from '../hooks/useLimits';
import { auth } from '../firebase';

const DEMO_RESPONSES = [
  'Conform legislatiei romane in vigoare, aceasta situatie este reglementata de Codul Civil. Va recomand sa consultati si jurisprudenta relevanta.',
  'Din perspectiva dreptului roman, trebuie sa avem in vedere atat prevederile legale, cat si doctrina majoritara in materie.',
  'Raspunsul depinde de mai multi factori, inclusiv natura juridica a raportului si calitatea partilor implicate.',
  'Conform art. 1270 C.civ., contractul valabil incheiat are putere de lege intre partile contractante — principiul fortei obligatorii.',
];

function LumiLocked({ onUpgrade }) {
  return (
    <div className="lumi-locked">
      <div className="lumi-locked__icon"><Icon.Lock /></div>
      <div className="lumi-locked__title">Lumi AI nu este disponibil pe planul Free</div>
      <p className="lumi-locked__desc">Upgradeaza la Essential sau Premium pentru acces la asistentul juridic AI.</p>
      <button className="lumi-locked__btn" onClick={onUpgrade}>Vezi planuri</button>
    </div>
  );
}

function LumiLimitAtins({ lumiRamase, onUpgrade }) {
  return (
    <div className="lumi-locked">
      <div className="lumi-locked__icon"><Icon.Lock /></div>
      <div className="lumi-locked__title">Limita lunara atinsa</div>
      <p className="lumi-locked__desc">Ai folosit toate intrebarile disponibile pentru luna aceasta. Upgradeaza pentru mai multe.</p>
      <button className="lumi-locked__btn" onClick={onUpgrade}>Upgrade plan</button>
    </div>
  );
}

export default function Lumi({ currentPlan, onUpgrade }) {
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Buna ziua. Sunt Lumi, asistentul juridic Verdikt. Cu ce va pot ajuta astazi?' }]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);
  const user      = auth.currentUser;

  const {
    loading: limitsLoading,
    lumiAceastaLuna,
    lumiRamase,
    lumiBlockate,
    lumiDisponibile,
    limits,
    incrementLumi,
  } = useLimits(user, currentPlan);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async text => {
    const msg = text || input.trim();
    if (!msg || lumiBlockate || !lumiDisponibile) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    await incrementLumi();
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
    setMessages(m => [...m, { role: 'ai', text: DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)] }]);
    setLoading(false);
  };

  return (
    <div className="lumiview">
      <div className="lumiview__chat">
        {/* Header cu limita */}
        {!limitsLoading && lumiDisponibile && limits.lumiPerLuna !== Infinity && (
          <div className="lumi-limit-bar">
            <div className="lumi-limit-bar__track">
              <div
                className="lumi-limit-bar__fill"
                style={{ width: `${Math.min(100, (lumiAceastaLuna / limits.lumiPerLuna) * 100)}%` }}
              />
            </div>
            <span className="lumi-limit-bar__label">
              {lumiBlockate
                ? 'Limita lunara atinsa'
                : `${lumiRamase} intrebari ramase luna aceasta`
              }
            </span>
          </div>
        )}

        {/* Continut principal */}
        {limitsLoading ? (
          <div className="lumi-loading">Se incarca...</div>
        ) : !lumiDisponibile ? (
          <LumiLocked onUpgrade={onUpgrade} />
        ) : lumiBlockate ? (
          <LumiLimitAtins lumiRamase={lumiRamase} onUpgrade={onUpgrade} />
        ) : (
          <>
            <div className="lumiview__messages">
              {messages.map((m, i) => (
                <div key={i} className={`lumiview__msg lumiview__msg--${m.role}`}>
                  {m.role === 'ai' && <div className="lumiview__avatar">V</div>}
                  <div className="lumiview__bubble">{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="lumiview__msg lumiview__msg--ai">
                  <div className="lumiview__avatar">AI</div>
                  <div className="lumiview__bubble lumiview__typing"><span /><span /><span /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="lumiview__suggested">
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} className="lumi-chip" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
            <div className="lumiview__input-row">
              <input
                className="lumiview__input"
                placeholder="Pune o intrebare juridica..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <button className="lumiview__send" onClick={() => send()} disabled={!input.trim() || loading}>
                <Icon.Arrow />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="lumiview__side">
        {/* Lock overlay pe side daca free */}
        {!lumiDisponibile ? (
          <div className="panel lumi-side-locked">
            <div className="lumi-side-locked__icon"><Icon.Lock /></div>
            <div className="lumi-side-locked__text">Disponibil din planul Essential</div>
            <button className="lumi-side-locked__btn" onClick={onUpgrade}>Upgrade</button>
          </div>
        ) : (
          <>
            <div className="panel">
              <div className="panel__header"><div className="panel__title">Subiecte frecvente</div></div>
              <div className="topic-list">
                {['Contracte si obligatii', 'Raspundere civila', 'Drepturi reale', 'Drept procesual', 'Infractiuni contra persoanei'].map(t => (
                  <button key={t} className="topic-item" onClick={() => send(`Explica-mi: ${t}`)}>{t}<Icon.Arrow /></button>
                ))}
              </div>
            </div>
            <div className="panel panel--stat">
              <div className="panel__header"><div className="panel__title">Sesiunea ta</div></div>
              <div className="lumi-session-stats">
                <div className="lumi-stat">
                  <span className="lumi-stat__val">{messages.filter(m => m.role === 'user').length}</span>
                  <span className="lumi-stat__label">Intrebari adresate</span>
                </div>
                {limits.lumiPerLuna !== Infinity && (
                  <div className="lumi-stat">
                    <span className="lumi-stat__val">{lumiRamase}</span>
                    <span className="lumi-stat__label">Ramase luna aceasta</span>
                  </div>
                )}
                <div className="lumi-stat">
                  <span className="lumi-stat__val">Ro</span>
                  <span className="lumi-stat__label">Limba activa</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}