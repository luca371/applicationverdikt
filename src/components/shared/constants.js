export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'grile',     label: 'Grile',     icon: 'book' },
  { id: 'lumiAI',    label: 'Lumi AI',   icon: 'chat' },
];

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'pe luna',
    features: [
      '10 grile / saptamana',
      'Fara acces Lumi AI',
      'Statistici de baza',
      'Acces materiale publice',
    ],
    cta: 'Plan curent',
    current: true,
  },
  {
    id: 'essential',
    name: 'Essential',
    price: '29',
    period: 'lei / luna',
    features: [
      'Grile nelimitate',
      '30 intrebari Lumi AI / luna',
      'Statistici avansate',
      'Teste simulate',
      'Suport prioritar',
    ],
    cta: 'Alege Essential',
    current: false,
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '59',
    period: 'lei / luna',
    features: [
      'Grile nelimitate',
      '100 intrebari Lumi AI / luna',
      'Statistici avansate',
      'Teste simulate',
      'Consultatii juridice',
      'Sesiuni live cu profesori',
    ],
    cta: 'Alege Premium',
    current: false,
  },
];

// Limite per plan
export const PLAN_LIMITS = {
  free:      { grilePerWeek: 10,       lumiPerMonth: 0   },
  essential: { grilePerWeek: Infinity, lumiPerMonth: 30  },
  premium:   { grilePerWeek: Infinity, lumiPerMonth: 100 },
};

export const ALL_GRILE = [
  { id: 1, materie: 'Civil',            intrebare: 'Care este termenul general de prescriptie extinctiva conform Noului Cod Civil?', variante: ['1 an', '3 ani', '5 ani', '10 ani'], corect: 1, explicatie: 'Conform art. 2517 C.civ., termenul general de prescriptie este de 3 ani.' },
  { id: 2, materie: 'Penal',            intrebare: 'Infractiunea de furt simplu se pedepseste cu:', variante: ['Inchisoare 6 luni – 3 ani', 'Inchisoare 1–5 ani', 'Amenda penala', 'Inchisoare 3–10 ani'], corect: 0, explicatie: 'Art. 228 C.pen. prevede pedeapsa inchisorii de la 6 luni la 3 ani sau amenda.' },
  { id: 3, materie: 'Procedura Civila', intrebare: 'In cat timp poate fi exercitata calea de atac a apelului?', variante: ['5 zile', '10 zile', '30 zile', '15 zile'], corect: 2, explicatie: 'Conform art. 468 C.proc.civ., termenul de apel este de 30 de zile de la comunicarea hotararii.' },
  { id: 4, materie: 'Procedura Penala', intrebare: 'Care este organul competent sa dispuna retinerea invinuitului?', variante: ['Judecatorul', 'Procurorul', 'Politia Judiciara', 'Organul de cercetare penala'], corect: 1, explicatie: 'Conform art. 209 C.proc.pen., procurorul este competent sa dispuna retinerea.' },
  { id: 5, materie: 'Civil',            intrebare: 'Ce reprezinta capacitatea de folosinta a persoanei fizice?', variante: ['Aptitudinea de a exercita drepturi', 'Aptitudinea de a avea drepturi si obligatii', 'Dreptul de a incheia acte juridice', 'Capacitatea procesual civila'], corect: 1, explicatie: 'Capacitatea de folosinta este aptitudinea persoanei de a avea drepturi si obligatii civile (art. 34 C.civ.).' },
  { id: 6, materie: 'Penal',            intrebare: 'La ce varsta incepe raspunderea penala in Romania?', variante: ['14 ani', '16 ani', '18 ani', '15 ani'], corect: 0, explicatie: 'Conform art. 113 C.pen., minorul care nu a implinit 14 ani nu raspunde penal.' },
  { id: 7, materie: 'Procedura Civila', intrebare: 'Ce este exceptia de necompetenta absoluta?', variante: ['O aparare de fond', 'O exceptie procesual relativa', 'O exceptie procesual absoluta ce poate fi invocata oricand', 'O cerere reconventionala'], corect: 2, explicatie: 'Exceptia de necompetenta absoluta poate fi invocata de oricare dintre parti, in orice stare a pricinii.' },
  { id: 8, materie: 'Procedura Penala', intrebare: 'Cat dureaza faza de urmarire penala in mod obisnuit?', variante: ['Nu are termen', '6 luni', '1 an', '30 zile'], corect: 0, explicatie: 'Codul de procedura penala nu stabileste un termen general pentru urmarirea penala.' },
];

export const MATERII_FILTER = ['Toate', 'Civil', 'Penal', 'Procedura Civila', 'Procedura Penala'];

export const SUGGESTED_QUESTIONS = [
  'Ce este nulitatea absoluta?',
  'Diferenta dintre delict si cvasi-delict',
  'Cand se aplica raspunderea solidara?',
  'Explicati uzucapiunea',
  'Ce este capacitatea de exercitiu?',
];

export const RECENT_ACTIVITY = [
  { label: 'Drept Civil — 12 grile', score: '10/12', time: 'Azi, 09:14', pct: 83 },
  { label: 'Drept Penal — 8 grile', score: '6/8', time: 'Ieri, 20:31', pct: 75 },
  { label: 'Procedura Civila — 10 grile', score: '9/10', time: '2 zile in urma', pct: 90 },
];

export const FACULTATI = [
  'Facultatea de Drept, Bucuresti',
  'Facultatea de Drept, Cluj-Napoca',
  'Facultatea de Drept, Iasi',
  'Facultatea de Drept, Timisoara',
  'Facultatea de Drept, Craiova',
  'Alta institutie',
];

export const ANI_STUDIU = ['Anul I', 'Anul II', 'Anul III', 'Masterat', 'Doctorat', 'Absolvent'];