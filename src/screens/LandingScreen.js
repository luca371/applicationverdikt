import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingScreen.css';

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <div className="header__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="header__logo-mark">V</div>
          <span className="header__logo-text">VERÐIKT</span>
        </div>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          {[
            { label: 'Grile', id: 'grile' },
            { label: 'Lumi AI', id: 'lumiAI' },
            { label: 'Abonamente', id: 'abonamente' },
            { label: 'FAQ', id: 'faq' },
          ].map((item) => (
            <button key={item.id} className="header__nav-link" onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header__actions">
          <button className="header__btn-login" onClick={() => navigate('/login')}>Log in</button>
          <button className="header__btn-signup" onClick={() => navigate('/signup')}>Sign up</button>
        </div>

        <button className="header__burger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__kicker">Platforma juridica pentru studenti</div>
        <h1 className="hero__title">
          Dreptul, simplu.<br />
          <em>Inteligent.</em><br />
          Al tau.
        </h1>
        <p className="hero__subtitle">
          Pregateste-te pentru examene cu grile inteligente si consulta Lumi AI,
          asistentul juridic specializat in legislatia romana.
        </p>
        <div className="hero__cta">
          <button className="btn-primary btn-primary--lg" onClick={() => navigate('/signup')}>
            Incepe gratuit
          </button>
          <button className="btn-outline" onClick={() => document.getElementById('grile')?.scrollIntoView({ behavior: 'smooth' })}>
            Exploreaza platforma
          </button>
        </div>
        <div className="hero__stats">
          {[
            { value: '12.000+', label: 'Grile rezolvate' },
            { value: '98%', label: 'Rata de promovare' },
            { value: '3.200+', label: 'Studenti activi' },
          ].map((s) => (
            <div key={s.label} className="hero__stat">
              <span className="hero__stat-value">{s.value}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero__visual">
        <div className="hero__card">
          <div className="hero__card-header">
            <span className="hero__card-dot r" />
            <span className="hero__card-dot y" />
            <span className="hero__card-dot g" />
            <span className="hero__card-title">Lumi AI - Asistent Juridic</span>
          </div>
          <div className="hero__card-body">
            <div className="hero__msg hero__msg--ai">
              <div className="hero__msg-avatar">AI</div>
              <div className="hero__msg-bubble">
                Conform art. 1270 C.civ., contractul valabil incheiat are putere de lege intre partile contractante.
              </div>
            </div>
            <div className="hero__msg hero__msg--user">
              <div className="hero__msg-avatar">TU</div>
              <div className="hero__msg-bubble">
                Ce este principiul fortei obligatorii?
              </div>
            </div>
            <div className="hero__card-cursor" />
          </div>
        </div>
        <div className="hero__card-float">
          <div className="hero__float-dot" />
          <div>
            <div className="hero__float-title">Grila noua disponibila</div>
            <div className="hero__float-sub">Drept Civil · 15 intrebari</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── GRILE SECTION ────────────────────────────────────────────────────────────
const GRILE_DATA = [
  {
    id: 1,
    materie: 'Drept Civil',
    intrebare: 'Care este termenul general de prescriptie extinctiva conform Noului Cod Civil?',
    variante: ['1 an', '3 ani', '5 ani', '10 ani'],
    corect: 1,
    explicatie: 'Conform art. 2517 C.civ., termenul general de prescriptie este de 3 ani.',
  },
  {
    id: 2,
    materie: 'Drept Penal',
    intrebare: 'Infractiunea de furt simplu se pedepseste cu:',
    variante: [
      'Inchisoare de la 6 luni la 3 ani',
      'Inchisoare de la 1 la 5 ani',
      'Amenda penala',
      'Inchisoare de la 3 la 10 ani',
    ],
    corect: 0,
    explicatie: 'Art. 228 C.pen. prevede pedeapsa inchisorii de la 6 luni la 3 ani sau amenda.',
  },
  {
    id: 3,
    materie: 'Drept Constitutional',
    intrebare: 'Cine numeste primul-ministru in Romania?',
    variante: ['Parlamentul', 'Presedintele Republicii', 'Curtea Constitutionala', 'Senatul'],
    corect: 1,
    explicatie: 'Conform art. 85 alin. (1) din Constitutie, Presedintele desemneaza si numeste primul-ministru.',
  },
];

function GrileSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = GRILE_DATA[currentQ];

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.corect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 < GRILE_DATA.length) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQ(0); setSelected(null);
    setAnswered(false); setScore(0); setFinished(false);
  };

  const scorePercent = GRILE_DATA.length > 0 ? Math.round((score / GRILE_DATA.length) * 100) : 0;
  const scoreMsg = scorePercent === 100
    ? `Ai terminat mostra cu ${score}/${GRILE_DATA.length} (100%). Impecabil!`
    : scorePercent >= 50
    ? `Ai terminat mostra cu ${score}/${GRILE_DATA.length} (${scorePercent}%). Esti pe drumul cel bun!`
    : `Ai terminat mostra cu ${score}/${GRILE_DATA.length} (${scorePercent}%). Mai exerseaza.`;

  const RAMURI = ['Drept civil', 'Drept penal', 'Drept procesual civil', 'Drept procesual penal'];

  return (
    <section id="grile" className="section grile-section">
      <div className="section__inner">
        <span className="section__eyebrow">Grile Interactive</span>
        <h2 className="section__title">Antreneaza-te cu grile<br />din materia ta</h2>
        <p className="section__subtitle">
          Sute de grile actualizate, cu explicatii detaliate dupa fiecare raspuns.
        </p>

        <div className="grile__layout">
          {/* LEFT — quiz widget */}
          <div className="grile__widget">
            {!finished ? (
              <>
                <div className="grile__progress-bar">
                  <div className="grile__progress-fill" style={{ width: `${(currentQ / GRILE_DATA.length) * 100}%` }} />
                </div>
                <div className="grile__meta">
                  <span className="grile__materie">{question.materie}</span>
                  <span className="grile__counter">{currentQ + 1} / {GRILE_DATA.length}</span>
                </div>
                <p className="grile__question">{question.intrebare}</p>
                <div className="grile__options">
                  {question.variante.map((v, idx) => {
                    let cls = 'grile__option';
                    if (answered) {
                      if (idx === question.corect) cls += ' grile__option--correct';
                      else if (idx === selected) cls += ' grile__option--wrong';
                      else cls += ' grile__option--dim';
                    } else if (selected === idx) cls += ' grile__option--selected';
                    return (
                      <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                        <span className="grile__option-letter">{String.fromCharCode(65 + idx)}</span>
                        {v}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className="grile__feedback">
                    <p>{question.explicatie}</p>
                    <button className="btn-primary" onClick={handleNext}>
                      {currentQ + 1 < GRILE_DATA.length ? 'Urmatoarea' : 'Vezi rezultatul'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="grile__result">
                <div className="grile__result-score">{score}/{GRILE_DATA.length}</div>
                <p className="grile__result-label">{scoreMsg}</p>
                <button className="btn-primary" onClick={handleReset}>Reincepe testul</button>
              </div>
            )}
          </div>

          {/* RIGHT — score + ramuri */}
          <div className="grile__sidebar">
            <div className="grile__sidebar-card">
              <div className="grile__sidebar-label">Scorul tau</div>
              <div className="grile__sidebar-score">
                {score}
                <span className="grile__sidebar-score-total"> / {GRILE_DATA.length}</span>
              </div>
              <p className="grile__sidebar-msg">
                {finished
                  ? scoreMsg
                  : score === 0
                  ? 'Raspunde la grile pentru a-ti vedea scorul.'
                  : scoreMsg}
              </p>
            </div>

            <div className="grile__sidebar-card">
              <div className="grile__sidebar-label">Ramuri acoperite</div>
              <ul className="grile__ramuri">
                {RAMURI.map((r) => (
                  <li key={r} className="grile__ramura">{r}</li>
                ))}
              </ul>
              <a
                href="#abonamente"
                className="grile__unlock"
                onClick={(e) => { e.preventDefault(); document.getElementById('abonamente')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Deblocheaza toate grilele
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── LUMI AI SECTION ──────────────────────────────────────────────────────────
const SUGGESTED = [
  'Ce este nulitatea absoluta?',
  'Diferenta dintre delict si cvasi-delict',
  'Cand se aplica raspunderea solidara?',
];

function LumiAISection() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Buna ziua. Sunt Lumi, asistentul juridic al platformei VERÐIKT. Va pot ajuta cu intrebari despre drept civil, penal, constitutional si alte ramuri ale dreptului romanesc.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const DEMO_RESPONSES = [
    'Conform legislatiei romane in vigoare, aceasta situatie este reglementata de Codul Civil. Va recomand sa consultati si jurisprudenta relevanta pentru o intelegere completa.',
    'Din perspectiva dreptului roman, trebuie sa avem in vedere atat prevederile legale, cat si doctrina majoritara in materie. Articolele relevante se gasesc in Codul Civil actualizat.',
    'Problema pe care o ridicati este una complexa. Raspunsul depinde de mai multi factori, inclusiv natura juridica a raportului si calitatea partilor implicate.',
  ];

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100 + Math.random() * 700));
    const reply = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
    setMessages((m) => [...m, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <section id="lumiAI" className="section lumi-section">
      <div className="section__inner">
        <div className="lumi__layout">
          <div className="lumi__info">
            <span className="section__eyebrow">Lumi AI</span>
            <h2 className="section__title">Asistentul tau juridic<br />disponibil 24/7</h2>
            <p className="section__subtitle">
              Lumi intelege contextul dreptului romanesc si ofera raspunsuri clare,
              cu referinte la articole si jurisprudenta.
            </p>
            <div className="lumi__features">
              {[
                { num: '01', title: 'Raspunsuri instant', desc: 'Fara asteptare, oricand ai nevoie.' },
                { num: '02', title: 'Baza legala actualizata', desc: 'Codul Civil, Penal, Constitutional si altele.' },
                { num: '03', title: 'Contextualizat', desc: 'Raspunsuri adaptate la nivelul si contextul tau.' },
              ].map((f) => (
                <div key={f.num} className="lumi__feature">
                  <span className="lumi__feature-num">{f.num}</span>
                  <div>
                    <div className="lumi__feature-title">{f.title}</div>
                    <div className="lumi__feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lumi__chat">
            <div className="lumi__chat-header">
              <div className="lumi__chat-avatar">AI</div>
              <div>
                <div className="lumi__chat-name">Lumi AI</div>
                <div className="lumi__chat-status"><span className="status-dot" />Online</div>
              </div>
            </div>
            <div className="lumi__messages">
              {messages.map((m, i) => (
                <div key={i} className={`lumi__message lumi__message--${m.role}`}>
                  {m.role === 'ai' && <div className="lumi__msg-avatar">AI</div>}
                  <div className="lumi__msg-bubble">{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="lumi__message lumi__message--ai">
                  <div className="lumi__msg-avatar">AI</div>
                  <div className="lumi__msg-bubble lumi__typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="lumi__suggested">
              {SUGGESTED.map((s) => (
                <button key={s} className="lumi__chip" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
            <div className="lumi__input-row">
              <input
                className="lumi__input"
                placeholder="Intreaba-l pe Lumi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <button className="lumi__send" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ABONAMENTE ───────────────────────────────────────────────────────────────
function AbonamenteSection() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      period: 'pe luna',
      badge: null,
      features: ['50 grile / luna', '5 intrebari Lumi AI / zi', 'Statistici de baza', 'Acces materiale publice'],
      cta: 'Incepe gratuit',
      highlight: false,
    },
    {
      name: 'Student',
      price: '29',
      period: 'lei / luna',
      badge: 'Recomandat',
      features: ['Grile nelimitate', 'Lumi AI nelimitat', 'Statistici avansate', 'Teste simulate', 'Suport prioritar'],
      cta: 'Alege Student',
      highlight: true,
    },
    {
      name: 'Pro',
      price: '59',
      period: 'lei / luna',
      badge: null,
      features: ['Tot din Student', 'Consultatii juridice', 'Documente AI generate', 'API Access', 'Sesiuni live cu profesori'],
      cta: 'Alege Pro',
      highlight: false,
    },
  ];

  return (
    <section id="abonamente" className="section abonamente-section">
      <div className="section__inner">
        <span className="section__eyebrow">Abonamente</span>
        <h2 className="section__title">Alege planul potrivit tie</h2>
        <p className="section__subtitle">Fara contracte, fara surprize. Poti anula oricand.</p>
        <div className="plans">
          {plans.map((p) => (
            <div key={p.name} className={`plan ${p.highlight ? 'plan--highlight' : ''}`}>
              {p.badge && <div className="plan__badge">{p.badge}</div>}
              <div className="plan__name">{p.name}</div>
              <div className="plan__price">
                <span className="plan__price-value">{p.price}</span>
                <span className="plan__price-period">{p.period}</span>
              </div>
              <ul className="plan__features">
                {p.features.map((f) => (
                  <li key={f}><span className="plan__check">+</span>{f}</li>
                ))}
              </ul>
              <button className={p.highlight ? 'btn-primary plan__cta' : 'btn-outline plan__cta'}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  { q: 'Cum functioneaza Lumi AI?', a: 'Lumi este un asistent AI specializat in dreptul romanesc. Poti pune intrebari in limbaj natural si vei primi raspunsuri cu referinte la articole de lege si jurisprudenta relevanta.' },
  { q: 'Grilele sunt actualizate cu legislatia in vigoare?', a: 'Da. Echipa noastra de juristi actualizeaza constant baza de date cu orice modificare legislativa, astfel incat sa te pregatesti cu informatii corecte.' },
  { q: 'Pot folosi VERÐIKT pe telefon?', a: 'Absolut. VERÐIKT este complet responsiv si functioneaza perfect pe orice dispozitiv - telefon, tableta sau laptop.' },
  { q: 'Exista o perioada de proba gratuita?', a: 'Planul Free iti ofera acces permanent la functionalitatile de baza. Planurile platite au o perioada de proba de 7 zile fara card.' },
  { q: 'Cum pot anula abonamentul?', a: 'Poti anula oricand din setarile contului tau, fara penalitati. Accesul ramane activ pana la sfarsitul perioadei platite.' },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="section faq-section">
      <div className="section__inner">
        <span className="section__eyebrow">FAQ</span>
        <h2 className="section__title">Intrebari frecvente</h2>
        <div className="faq__list">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className={`faq__item ${open === i ? 'faq__item--open' : ''}`}>
              <button className="faq__question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <span className="faq__icon">{open === i ? '\u2212' : '+'}</span>
              </button>
              <div className="faq__answer"><p>{item.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="footer__logo-mark">V</div>
            <span className="footer__logo-text">VERÐIKT</span>
          </div>
          <p className="footer__tagline">Dreptul, simplu. Inteligent. AI tau.</p>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <div className="footer__col-title">Platforma</div>
            <a href="#grile">Grile</a>
            <a href="#lumiAI">Lumi AI</a>
            <a href="#abonamente">Abonamente</a>
          </div>
          <div className="footer__col">
            <div className="footer__col-title">Legal</div>
            <a href="#!">Termeni si conditii</a>
            <a href="#!">Politica de confidentialitate</a>
          </div>
          <div className="footer__col">
            <div className="footer__col-title">Contact</div>
            <a href="mailto:contact@VERÐIKT.ro">contact@VERÐIKT.ro</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2025 VERÐIKT. Toate drepturile rezervate.</span>
      </div>
    </footer>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default function LandingScreen() {
  return (
    <div className="landing">
      <Header />
      <Hero />
      <GrileSection />
      <LumiAISection />
      <AbonamenteSection />
      <FAQSection />
      <Footer />
    </div>
  );
}