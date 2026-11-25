import {
  AssignmentRecord,
  CertificateRecord,
  CourseItem,
  EducationCycle,
  ExamPaper,
  Language,
  ParentRecord,
  PaymentRecord,
  QuizQuestion,
  StudentRecord,
} from '../types';

export function generateUniqueCode(prefix: 'ELV' | 'PAR', existingCodes: Iterable<string> = []): string {
  const used = new Set(existingCodes);
  for (let i = 0; i < 50; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${prefix}-2026-${num}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${prefix}-2026-${Date.now().toString().slice(-4)}`;
}

export interface LevelInfo {
  classe: string;
  cycle: EducationCycle;
  exam: string;
  price: number;
}

export const LEVEL_GROUPS: {label: string; cycle: EducationCycle; items: LevelInfo[]}[] = [
  {
    label: 'Primaire',
    cycle: 'Primaire',
    items: [
      {classe: 'SIL', cycle: 'Primaire', exam: 'Lecture & Calcul', price: 500},
      {classe: 'CP', cycle: 'Primaire', exam: 'Fondamentaux', price: 500},
      {classe: 'CE1', cycle: 'Primaire', exam: 'Expression & Calcul', price: 500},
      {classe: 'CE2', cycle: 'Primaire', exam: 'Consolidation', price: 500},
      {classe: 'CM1', cycle: 'Primaire', exam: 'Prépa CEP', price: 500},
      {classe: 'CM2', cycle: 'Primaire', exam: 'CEP', price: 500},
    ],
  },
  {
    label: 'Collège',
    cycle: 'Collège',
    items: [
      {classe: '6ème', cycle: 'Collège', exam: 'Cycle Observation', price: 1000},
      {classe: '5ème', cycle: 'Collège', exam: 'Fondamentaux Collège', price: 1000},
      {classe: '4ème', cycle: 'Collège', exam: 'Prépa BEPC', price: 1000},
      {classe: '3ème', cycle: 'Collège', exam: 'BEPC', price: 1000},
    ],
  },
  {
    label: 'Lycée',
    cycle: 'Lycée',
    items: [
      {classe: '2nde', cycle: 'Lycée', exam: 'Tronc Commun', price: 1500},
      {classe: '1ère', cycle: 'Lycée', exam: 'Probatoire', price: 1500},
      {classe: 'Terminale A', cycle: 'Lycée', exam: 'BAC A', price: 1500},
      {classe: 'Terminale C', cycle: 'Lycée', exam: 'BAC C', price: 1500},
      {classe: 'Terminale D', cycle: 'Lycée', exam: 'BAC D', price: 1500},
    ],
  },
  {
    label: 'Université',
    cycle: 'Université',
    items: [
      {classe: 'Licence 1', cycle: 'Université', exam: 'Semestres 1–2', price: 2000},
      {classe: 'Licence 2', cycle: 'Université', exam: 'Semestres 3–4', price: 2000},
      {classe: 'Licence 3', cycle: 'Université', exam: 'Licence & Mémoire', price: 2000},
      {classe: 'Master 1', cycle: 'Université', exam: 'Recherche & Projets', price: 2000},
      {classe: 'Master 2', cycle: 'Université', exam: 'Soutenance & CV', price: 2000},
    ],
  },
];

export function getLevelInfo(classe: string): LevelInfo {
  for (const group of LEVEL_GROUPS) {
    const found = group.items.find((item) => item.classe === classe);
    if (found) return found;
  }
  return {classe: '3ème', cycle: 'Collège', exam: 'BEPC', price: 1000};
}

export const TRANSLATIONS: Record<
  Language,
  {
    slogan: string;
    heroTitle: string;
    heroSubtitle: string;
    loginStudent: string;
    createAccount: string;
    connectBtn: string;
    registerBtn: string;
    hello: string;
    discussTitle: string;
    askPlaceholder: string;
    send: string;
    speakToSisto: string;
    listenSisto: string;
    stopVoice: string;
    myCourses: string;
    offlineReady: string;
    quickQuiz: string;
    timedExam: string;
    certificates: string;
    goPremium: string;
    logout: string;
    installApp: string;
    downloadOffline: string;
    offlineDownloaded: string;
    onlineLabel: string;
    offlineLabel: string;
    syncNow: string;
    parentSpace: string;
    schoolSpace: string;
    adminSpace: string;
    backToApp: string;
  }
> = {
  fr: {
    slogan: 'Ton grand frère qui te parle, même sans internet',
    heroTitle: "De la SIL à l'Université, révise avec ton grand frère à tes côtés.",
    heroSubtitle:
      'Cours audio en Français, Fulfulde et English, préparation CEP, BEPC, Probatoire, BAC et Université, accessibles hors-ligne à Ngaoundéré et partout au Cameroun.',
    loginStudent: 'Connexion Élève',
    createAccount: 'Créer un compte',
    connectBtn: 'Se Connecter',
    registerBtn: 'Créer mon compte',
    hello: 'Salut,',
    discussTitle: 'Discute avec Sisto',
    askPlaceholder: 'Pose ta question (ex: espagnol, maths, bac, cv)...',
    send: 'Envoyer',
    speakToSisto: 'Parler à Sisto',
    listenSisto: 'Écouter Sisto',
    stopVoice: 'Stop',
    myCourses: 'Mes Cours',
    offlineReady: 'Disponibles hors-ligne',
    quickQuiz: 'Quiz Rapide',
    timedExam: 'Épreuve BEPC / BAC — Chronomètre',
    certificates: 'Certificats',
    goPremium: 'Passer Premium',
    logout: 'Déconnexion',
    installApp: 'Installer SISTO MASTER',
    downloadOffline: 'Télécharger Hors-ligne',
    offlineDownloaded: 'Pack Hors-ligne prêt',
    onlineLabel: 'En ligne',
    offlineLabel: 'Mode Hors-ligne',
    syncNow: 'Synchroniser maintenant',
    parentSpace: 'Espace Parents',
    schoolSpace: 'Espace École / Université',
    adminSpace: 'Super Admin',
    backToApp: 'Retour à mon espace',
  },
  ff: {
    slogan: 'Mawniiko mo haaldata e maa, hay so internet walaa',
    heroTitle: 'Gila SIL haa Jaaɓi-haaɗtirde, janngu bee mawniiko haa Ngaoundéré.',
    heroSubtitle:
      'Jannde daande e Farayse, Fulfulde e Engeleere, taskagol CEP, BEPC, BAC e Jaaɓi-haaɗtirde, huuwata hay so internet walaa.',
    loginStudent: 'Naatugol Almuudo',
    createAccount: 'Maɓɓit Konte',
    connectBtn: 'Naatu',
    registerBtn: 'Maɓɓit konte am',
    hello: 'Jam tan,',
    discussTitle: 'Haaldu e Sisto',
    askPlaceholder: 'Yam Sisto (espagnol, maths, anglais, bac)...',
    send: 'Neldu',
    speakToSisto: 'Haaldu e Sisto',
    listenSisto: 'Heɗo Sisto',
    stopVoice: 'Dar',
    myCourses: 'Janndeeji Am',
    offlineReady: 'Woodi so internet walaa',
    quickQuiz: 'Yamɗe Yaawɗe',
    timedExam: 'Jarribagol BEPC / BAC',
    certificates: 'Seedanteeji',
    goPremium: 'Ɓeydu Premium',
    logout: 'Yaltu',
    installApp: 'Joɓɓin SISTO MASTER',
    downloadOffline: 'Aawto ngam Hors-ligne',
    offlineDownloaded: 'Hors-ligne heblii',
    onlineLabel: 'Online',
    offlineLabel: 'Hors-ligne',
    syncNow: 'Synchroniser jooni',
    parentSpace: 'Nokkuure Baaba & Yaaya',
    schoolSpace: 'Nokkuure Janngirde',
    adminSpace: 'Super Admin',
    backToApp: 'Rutto haa janngirde',
  },
  en: {
    slogan: 'Your older brother who speaks to you, even offline',
    heroTitle: 'From Primary SIL to Master 2, master every exam with your mentor.',
    heroSubtitle:
      'Voice-enabled lessons in French, Fulfulde, and English covering CEP, BEPC, BAC, and University degrees—engineered for offline access across Cameroon.',
    loginStudent: 'Student Sign In',
    createAccount: 'Create Account',
    connectBtn: 'Sign In',
    registerBtn: 'Create My Account',
    hello: 'Hello,',
    discussTitle: 'Talk with Sisto',
    askPlaceholder: 'Ask a question (spanish, maths, english, bac, cv)...',
    send: 'Send',
    speakToSisto: 'Speak to Sisto',
    listenSisto: 'Listen to Sisto',
    stopVoice: 'Stop',
    myCourses: 'My Lessons',
    offlineReady: 'Available offline',
    quickQuiz: 'Quick Quiz',
    timedExam: 'BEPC / BAC Timed Exam',
    certificates: 'Certificates',
    goPremium: 'Upgrade to Premium',
    logout: 'Sign Out',
    installApp: 'Install SISTO MASTER',
    downloadOffline: 'Save for Offline',
    offlineDownloaded: 'Offline Pack Ready',
    onlineLabel: 'Online',
    offlineLabel: 'Offline Mode',
    syncNow: 'Sync Now',
    parentSpace: 'Parents Portal',
    schoolSpace: 'School & University Portal',
    adminSpace: 'Super Admin',
    backToApp: 'Back to App',
  },
};

export const COURSES: CourseItem[] = [
  // Primaire
  {
    id: 'prim-1',
    cycle: 'Primaire',
    subject: 'Lecture & Français',
    title: 'Syllabes, sons composés et lecture fluide (SIL–CP)',
    durationMin: 12,
    summary:
      'Maîtrise les sons essentiels (ou, on, an, oi, ch) et construis tes premières phrases simples pour lire avec confiance.',
    keyPoints: [
      'Associer consonnes et voyelles pour former des syllabes claires.',
      'Distinguer les sons proches : b/p, d/t, f/v.',
      'Lire à voix haute 5 phrases du quotidien à Ngaoundéré.',
    ],
    spokenScript:
      "Bravo petit frère ! Aujourd'hui on révise les sons composés : O-U fait OU comme dans mouton, O-N fait ON comme dans maison. Répète doucement après moi.",
  },
  {
    id: 'prim-2',
    cycle: 'Primaire',
    subject: 'Calcul Rapide',
    title: 'Additions, multiplications et problèmes du marché (CE–CM2)',
    durationMin: 15,
    summary:
      'Résous des problèmes concrets en francs CFA, maîtrise les tables de 2 à 9 et prépare les épreuves du CEP.',
    keyPoints: [
      'Poser correctement les retenues en addition et multiplication.',
      'Calculer une monnaie rendue en FCFA sans calculatrice.',
      'Vérifier son résultat par l’ordre de grandeur.',
    ],
    spokenScript:
      'Au marché, si un cahier coûte 350 francs et que tu achètes 2 cahiers, cela fait 700 francs. Si tu donnes un billet de 1000 francs, on te rend 300 francs.',
  },
  {
    id: 'prim-3',
    cycle: 'Primaire',
    subject: 'Anglais Débutant',
    title: 'Greetings, Numbers & Family (SIL–CM2)',
    durationMin: 10,
    summary:
      'Apprends à saluer en anglais, compter jusqu’à 20 et présenter ta famille en toute simplicité.',
    keyPoints: [
      'Good morning (bonjour le matin), Good afternoon (après-midi).',
      'My name is... / I live in Ngaoundéré.',
      'Compter de 1 à 20 avec la bonne prononciation.',
    ],
    spokenScript:
      'Hello! Say after me: Good morning, my name is Emmanuel. I am a student in Cameroon.',
  },
  // Collège
  {
    id: 'col-1',
    cycle: 'Collège',
    subject: 'Espagnol LV2',
    title: 'Saluer, se présenter et conjuguer au présent (4ème–3ème)',
    durationMin: 18,
    summary:
      'Les bases incontournables du BEPC en Espagnol : ser vs estar, présent de l’indicatif et dialogue de présentation.',
    keyPoints: [
      'Hola (Bonjour), Buenos días, ¿Cómo estás? (Comment vas-tu ?).',
      'Ser pour l’identité (Soy camerunés), Estar pour le lieu ou l’état (Estoy en clase).',
      'Terminaisons des verbes en -AR : -o, -as, -a, -amos, -áis, -an.',
    ],
    spokenScript:
      'Hola amigo ! Pour le BEPC en Espagnol, retiens la règle d’or : SER sert à dire qui tu es, par exemple Soy estudiante. ESTAR sert à dire où tu es ou comment tu vas : Estoy bien.',
  },
  {
    id: 'col-2',
    cycle: 'Collège',
    subject: 'Mathématiques',
    title: 'Théorème de Pythagore, Thalès et équations du 1er degré',
    durationMin: 22,
    summary:
      'Méthode étape par étape pour réussir l’exercice de géométrie et l’algèbre au BEPC.',
    keyPoints: [
      'Pythagore dans un triangle rectangle : BC² = AB² + AC².',
      'Résoudre ax + b = c en isolant l’inconnue x proprement.',
      'Rédiger une justification claire avec les données de l’énoncé.',
    ],
    spokenScript:
      "En Maths pour la 3ème, pense toujours au triangle rectangle pour Pythagore : le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
  },
  {
    id: 'col-3',
    cycle: 'Collège',
    subject: 'Anglais',
    title: 'Present Perfect, Modals & Reading Comprehension (BEPC)',
    durationMin: 16,
    summary:
      'Structures grammaticales clés et astuces pour répondre vite et juste aux questions de texte au BEPC.',
    keyPoints: [
      'Have/Has + Past Participle pour une action liée au présent.',
      'Modaux : must (obligation), should (conseil), can (capacité).',
      'Repérer les mots-clés dans le texte avant de rédiger.',
    ],
    spokenScript:
      'In English for BEPC, remember: Have plus past participle forms the present perfect. For example: I have studied my lessons today.',
  },
  {
    id: 'col-4',
    cycle: 'Collège',
    subject: 'SVT & Physique',
    title: 'Circuit électrique simple et nutrition humaine',
    durationMin: 15,
    summary:
      'Comprends la loi d’Ohm (U = R × I) et les étapes de la digestion pour gagner des points faciles.',
    keyPoints: [
      'Loi d’Ohm : U en Volts, R en Ohms, I en Ampères.',
      'Montage en série vs montage en dérivation.',
      'Transformation mécanique et chimique des aliments.',
    ],
    spokenScript:
      "En Physique, retiens la formule magique U égale R fois I. Si la résistance est de 10 ohms et le courant de 2 ampères, la tension vaut 20 volts.",
  },
  // Lycée
  {
    id: 'lyc-1',
    cycle: 'Lycée',
    subject: 'Mathématiques BAC',
    title: 'Étude de fonctions, dérivées, limites et logarithmes',
    durationMin: 28,
    summary:
      'Plan complet en 6 étapes pour traiter n’importe quel problème d’analyse au Probatoire et au Baccalauréat C & D.',
    keyPoints: [
      'Domaine de définition et limites aux bornes.',
      'Calcul de f’(x), signe de la dérivée et tableau de variations.',
      'Asymptotes horizontales, verticales et obliques.',
    ],
    spokenScript:
      'Au BAC C et D, une étude de fonction suit toujours le même plan : domaine, limites, dérivée, signe de la dérivée, tableau de variations puis courbe.',
  },
  {
    id: 'lyc-2',
    cycle: 'Lycée',
    subject: 'Philosophie',
    title: 'Méthodologie de la dissertation philosophique (Terminale)',
    durationMin: 20,
    summary:
      'Construis une introduction avec problématique, un plan dialectique (Thèse – Antithèse – Synthèse) et des transitions fluides.',
    keyPoints: [
      'Analyser les mots-clés du sujet avant de rédiger.',
      'Formuler une problématique paradoxale claire.',
      'Appuyer chaque argument d’un auteur et d’un exemple concret.',
    ],
    spokenScript:
      'En Philosophie au BAC, ne récite jamais ton cours. Problématise le sujet dès l’introduction, puis développe thèse, antithèse et dépassement.',
  },
  {
    id: 'lyc-3',
    cycle: 'Lycée',
    subject: 'Physique-Chimie',
    title: 'Mécanique newtonienne et dosages acido-basiques',
    durationMin: 24,
    summary:
      'Deuxième loi de Newton (ΣF = m·a), équivalence pH-métrique et bilan énergétique.',
    keyPoints: [
      'Choisir un référentiel galiléen et projeter les forces sur les axes.',
      'À l’équivalence d’un dosage : Ca·Va = Cb·Vb.',
      'Attention constante aux unités du Système International.',
    ],
    spokenScript:
      'Pour la mécanique au Baccalauréat, commence toujours par définir le système, le référentiel, puis fais le bilan des forces avant d’écrire somme des forces égale m a.',
  },
  // Université
  {
    id: 'uni-1',
    cycle: 'Université',
    subject: 'Carrière & CV',
    title: 'Rédiger un CV percutant et réussir son entretien (L1–M2)',
    durationMin: 18,
    summary:
      'Structure d’un CV professionnel au standard camerounais et international, lettre de motivation et pitch de stage.',
    keyPoints: [
      'Titre clair ciblant le poste ou le stage recherché.',
      'Quantifier ses projets académiques et associatifs.',
      'Préparer la réponse à : "Parlez-moi de vous en 90 secondes".',
    ],
    spokenScript:
      'À l’Université, ton CV doit tenir sur une page claire. Mets en avant tes projets réalisés, tes compétences techniques et tes résultats chiffrés.',
  },
  {
    id: 'uni-2',
    cycle: 'Université',
    subject: 'Méthodologie LMD',
    title: 'Recherche bibliographique, mémoire et soutenance',
    durationMin: 25,
    summary:
      'Méthode IMRAD pour rédiger un rapport de stage ou mémoire de Licence/Master et convaincre le jury.',
    keyPoints: [
      'Problématique, hypothèses et revue de littérature rigoureuse.',
      'Normes de citation APA ou IEEE sans plagiat.',
      'Supports visuels épurés : 10 diapositives max pour 15 min de soutenance.',
    ],
    spokenScript:
      'Pour réussir ta soutenance de Licence ou Master à Ngaoundéré, maîtrise ta problématique, tes résultats clés et prépare les réponses aux questions du jury.',
  },
  {
    id: 'uni-3',
    cycle: 'Université',
    subject: 'Algorithmique & Data',
    title: 'Complexité algorithmique, structures de données et SQL',
    durationMin: 26,
    summary:
      'Maîtrise les tableaux, listes, arbres, notation Big-O et requêtes SQL relationnelles pour les examens de L1–L3.',
    keyPoints: [
      'Évaluer la complexité temporelle O(1), O(log n), O(n), O(n²).',
      'Jointures SQL (INNER JOIN, LEFT JOIN) et agrégations GROUP BY.',
      'Écrire des algorithmes lisibles et testés sur cas limites.',
    ],
    spokenScript:
      'En algorithmique universitaire, cherche toujours à passer d’une boucle double O de n carré à une approche par table de hachage ou tri en O de n log n.',
  },
];

export const QUICK_QUIZZES: QuizQuestion[] = [
  {
    id: 'q1',
    cycle: 'All',
    subject: 'Espagnol',
    question: "En Espagnol, que veut dire « Hola » ?",
    options: ['A) Bonjour', 'B) Au revoir', 'C) Merci beaucoup'],
    correctIndex: 0,
    explanation: '« Hola » signifie « Bonjour / Salut » en espagnol courant.',
  },
  {
    id: 'q2',
    cycle: 'Collège',
    subject: 'Mathématiques',
    question: 'Si 3x + 6 = 21, quelle est la valeur de x ?',
    options: ['A) x = 3', 'B) x = 5', 'C) x = 7'],
    correctIndex: 1,
    explanation: '3x = 21 - 6 = 15, donc x = 15 / 3 = 5.',
  },
  {
    id: 'q3',
    cycle: 'All',
    subject: 'Anglais',
    question: 'Choisis la bonne phrase : "Yesterday, Emmanuel ____ his homework."',
    options: ['A) finish', 'B) finished', 'C) will finish'],
    correctIndex: 1,
    explanation: '« Yesterday » indique le passé simple (Simple Past) : finished.',
  },
  {
    id: 'q4',
    cycle: 'Lycée',
    subject: 'Mathématiques',
    question: 'Quelle est la dérivée de f(x) = x³ + 4x ?',
    options: ['A) 3x² + 4', 'B) x² + 4', 'C) 3x + 4'],
    correctIndex: 0,
    explanation: 'La dérivée de xⁿ est n·xⁿ⁻¹, donc (x³)’ = 3x² et (4x)’ = 4.',
  },
  {
    id: 'q5',
    cycle: 'Université',
    subject: 'Informatique',
    question: 'Quelle est la complexité d’une recherche binaire dans un tableau trié ?',
    options: ['A) O(n)', 'B) O(log n)', 'C) O(n²)'],
    correctIndex: 1,
    explanation: 'À chaque étape on divise l’intervalle par 2, soit O(log n).',
  },
  {
    id: 'q6',
    cycle: 'All',
    subject: 'Physique-Chimie',
    question: 'D’après la loi d’Ohm, quelle est la formule reliant tension U, résistance R et intensité I ?',
    options: ['A) U = R × I', 'B) U = R / I', 'C) I = U × R'],
    correctIndex: 0,
    explanation: 'La loi d’Ohm s’écrit U = R × I (U en Volts, R en Ohms, I en Ampères).',
  },
  {
    id: 'q7',
    cycle: 'All',
    subject: 'SVT',
    question: 'Quel organite cellulaire produit l’énergie (ATP) par respiration cellulaire ?',
    options: ['A) Le ribosome', 'B) La mitochondrie', 'C) L’appareil de Golgi'],
    correctIndex: 1,
    explanation: 'La mitochondrie est la centrale énergétique de la cellule eucaryote.',
  },
  {
    id: 'q8',
    cycle: 'Lycée',
    subject: 'Philosophie',
    question: 'Quel philosophe a formulé « Je pense, donc je suis » (Cogito ergo sum) ?',
    options: ['A) Emmanuel Kant', 'B) René Descartes', 'C) Jean-Paul Sartre'],
    correctIndex: 1,
    explanation: 'René Descartes établit le Cogito dans le Discours de la méthode (1637).',
  },
];

export const EXAM_PAPERS: ExamPaper[] = [
  {
    id: 'ep-maths',
    subject: 'Mathématiques',
    cycle: 'Tous',
    examLabel: 'CEP · BEPC · BAC',
    durationMinutes: 120,
    coefficient: 4,
    questions: [
      {
        id: 'm1',
        cycle: 'Collège',
        subject: 'Mathématiques',
        question: 'Dans un triangle ABC rectangle en A avec AB = 3 cm et AC = 4 cm, combien vaut BC ?',
        options: ['A) 5 cm', 'B) 7 cm', 'C) 6 cm'],
        correctIndex: 0,
        explanation: 'Par le théorème de Pythagore : BC² = 3² + 4² = 9 + 16 = 25, donc BC = 5 cm.',
      },
      {
        id: 'm2',
        cycle: 'Lycée',
        subject: 'Mathématiques',
        question: 'Quelle est la limite de (2x² + 3x) / (x² - 1) lorsque x tend vers +∞ ?',
        options: ['A) 0', 'B) 2', 'C) +∞'],
        correctIndex: 1,
        explanation: 'En +∞, on prend le quotient des termes de plus haut degré : 2x² / x² = 2.',
      },
      {
        id: 'm3',
        cycle: 'Primaire',
        subject: 'Mathématiques',
        question: 'Un élève achète 3 cahiers à 450F l’unité et paie avec un billet de 2000F. Quelle monnaie reçoit-il ?',
        options: ['A) 650F', 'B) 550F', 'C) 750F'],
        correctIndex: 0,
        explanation: '3 × 450 = 1350F. Monnaie rendue : 2000 - 1350 = 650F.',
      },
    ],
  },
  {
    id: 'ep-francais',
    subject: 'Français',
    cycle: 'Tous',
    examLabel: 'CEP · BEPC · BAC',
    durationMinutes: 120,
    coefficient: 3,
    questions: [
      {
        id: 'f1',
        cycle: 'Collège',
        subject: 'Français',
        question: 'Dans la phrase « Les élèves révisent leurs leçons », quelle est la fonction de « leurs leçons » ?',
        options: ['A) Sujet', 'B) Complément d’Objet Indirect', 'C) Complément d’Objet Direct (COD)'],
        correctIndex: 2,
        explanation: 'Les élèves révisent quoi ? « leurs leçons » est le COD du verbe réviser.',
      },
      {
        id: 'f2',
        cycle: 'Lycée',
        subject: 'Français',
        question: 'Quelle figure de style est utilisée dans « Cette obscure clarté qui tombe des étoiles » ?',
        options: ['A) Un oxymore', 'B) Une anaphore', 'C) Une hyperbole'],
        correctIndex: 0,
        explanation: 'L’oxymore réunit deux termes opposés (« obscure » et « clarté ») dans un même syntagme.',
      },
      {
        id: 'f3',
        cycle: 'Primaire',
        subject: 'Français',
        question: 'Choisis l’accord correct : « Les mangues que nous avons ____ sont sucrées. »',
        options: ['A) acheté', 'B) achetées', 'C) achetés'],
        correctIndex: 1,
        explanation: 'Avec l’auxiliaire avoir, le participe passé s’accorde avec le COD (« les mangues », fém. plur.) placé avant.',
      },
    ],
  },
  {
    id: 'ep-anglais',
    subject: 'Anglais',
    cycle: 'Tous',
    examLabel: 'CEP · BEPC · BAC',
    durationMinutes: 90,
    coefficient: 3,
    questions: [
      {
        id: 'en1',
        cycle: 'Collège',
        subject: 'Anglais',
        question: 'Complete: "If she ____ hard, she will pass the BEPC exam."',
        options: ['A) study', 'B) studies', 'C) studied'],
        correctIndex: 1,
        explanation: 'Conditionnel type 1 : If + Simple Present (she studies) + will + base verbale.',
      },
      {
        id: 'en2',
        cycle: 'Lycée',
        subject: 'Anglais',
        question: 'Choose the right passive voice: "Teachers mark the scripts."',
        options: [
          'A) The scripts are marked by teachers.',
          'B) The scripts were marked by teachers.',
          'C) The scripts are marking teachers.',
        ],
        correctIndex: 0,
        explanation: 'Au présent simple, la voix passive suit la forme : are/is + past participle.',
      },
      {
        id: 'en3',
        cycle: 'Université',
        subject: 'Anglais',
        question: 'Which preposition completes: "He succeeded ____ solving the problem" ?',
        options: ['A) on', 'B) at', 'C) in'],
        correctIndex: 2,
        explanation: 'On utilise toujours « succeed in + verb-ing » en anglais académique.',
      },
    ],
  },
  {
    id: 'ep-espagnol',
    subject: 'Espagnol (LV2)',
    cycle: 'Collège',
    examLabel: 'BEPC · Probatoire · BAC',
    durationMinutes: 90,
    coefficient: 2,
    questions: [
      {
        id: 'es1',
        cycle: 'Collège',
        subject: 'Espagnol',
        question: 'Complète correctement : « Yo ____ estudiante en Ngaoundéré. »',
        options: ['A) soy', 'B) estoy', 'C) eres'],
        correctIndex: 0,
        explanation: 'Pour l’identité ou la profession, on emploie le verbe SER : Yo soy estudiante.',
      },
      {
        id: 'es2',
        cycle: 'Lycée',
        subject: 'Espagnol',
        question: 'Quel est le prétérit (indefinido) de « tener » à la 1ère personne du singulier ?',
        options: ['A) tení', 'B) tuve', 'C) tengo'],
        correctIndex: 1,
        explanation: 'Tener est irrégulier au passé simple espagnol : tuve, tuviste, tuvo...',
      },
      {
        id: 'es3',
        cycle: 'Collège',
        subject: 'Espagnol',
        question: 'Comment traduit-on « J’aime étudier les mathématiques » ?',
        options: [
          'A) Me gusta estudiar matemáticas.',
          'B) Yo gusto estudiar matemáticas.',
          'C) Me gustan estudiar matemáticas.',
        ],
        correctIndex: 0,
        explanation: 'Avec un verbe à l’infinitif (estudiar), « gustar » reste toujours au singulier : Me gusta.',
      },
    ],
  },
  {
    id: 'ep-allemand',
    subject: 'Allemand (LV2)',
    cycle: 'Collège',
    examLabel: 'BEPC · Probatoire · BAC',
    durationMinutes: 90,
    coefficient: 2,
    questions: [
      {
        id: 'de1',
        cycle: 'Collège',
        subject: 'Allemand',
        question: 'Quel article défini convient devant « Buch » (neutre, nominatif singulier) ?',
        options: ['A) der', 'B) die', 'C) das'],
        correctIndex: 2,
        explanation: 'En allemand, « das Buch » est de genre neutre au nominatif singulier.',
      },
      {
        id: 'de2',
        cycle: 'Lycée',
        subject: 'Allemand',
        question: 'Quelle préposition régit toujours le datif ?',
        options: ['A) mit', 'B) für', 'C) ohne'],
        correctIndex: 0,
        explanation: '« mit » (avec) régit toujours le datif ; « für » et « ohne » régissent l’accusatif.',
      },
      {
        id: 'de3',
        cycle: 'Collège',
        subject: 'Allemand',
        question: 'Complète : « Ich ____ jeden Tag meine Lektionen. » (lernen)',
        options: ['A) lernst', 'B) lerne', 'C) lernt'],
        correctIndex: 1,
        explanation: 'Avec « ich », le présent de l’indicatif prend la terminaison -e : ich lerne.',
      },
    ],
  },
  {
    id: 'ep-physique',
    subject: 'Physique-Chimie',
    cycle: 'Lycée',
    examLabel: 'BEPC · BAC C & D',
    durationMinutes: 120,
    coefficient: 4,
    questions: [
      {
        id: 'pc1',
        cycle: 'Collège',
        subject: 'Physique-Chimie',
        question: 'Une résistance de 15 Ω est traversée par un courant de 0,4 A. Quelle est la tension U ?',
        options: ['A) 6 V', 'B) 37,5 V', 'C) 15,4 V'],
        correctIndex: 0,
        explanation: 'Loi d’Ohm : U = R × I = 15 × 0,4 = 6 Volts.',
      },
      {
        id: 'pc2',
        cycle: 'Lycée',
        subject: 'Physique-Chimie',
        question: 'Quelle est l’unité de la force dans le Système International (SI) ?',
        options: ['A) Le Joule (J)', 'B) Le Newton (N)', 'C) Le Watt (W)'],
        correctIndex: 1,
        explanation: 'La force s’exprime en Newton (N), l’énergie en Joule et la puissance en Watt.',
      },
      {
        id: 'pc3',
        cycle: 'Lycée',
        subject: 'Physique-Chimie',
        question: 'À 25 °C, une solution aqueuse dont le pH est égal à 3 est :',
        options: ['A) Basique', 'B) Neutre', 'C) Acide'],
        correctIndex: 2,
        explanation: 'À 25 °C, pH < 7 caractérise une solution acide, pH = 7 neutre et pH > 7 basique.',
      },
    ],
  },
  {
    id: 'ep-svt',
    subject: 'SVT',
    cycle: 'Lycée',
    examLabel: 'BEPC · BAC D',
    durationMinutes: 120,
    coefficient: 4,
    questions: [
      {
        id: 'svt1',
        cycle: 'Collège',
        subject: 'SVT',
        question: 'Quel vaisseau sanguin transporte le sang du cœur vers les organes ?',
        options: ['A) Une veine', 'B) Une artère', 'C) Un canal lymphatique'],
        correctIndex: 1,
        explanation: 'Les artères partent du cœur vers les organes ; les veines ramènent le sang au cœur.',
      },
      {
        id: 'svt2',
        cycle: 'Lycée',
        subject: 'SVT',
        question: 'Dans l’ADN, quelle base azotée est toujours complémentaire de l’Adénine (A) ?',
        options: ['A) La Thymine (T)', 'B) La Cytosine (C)', 'C) La Guanine (G)'],
        correctIndex: 0,
        explanation: 'Dans la double hélice d’ADN, A s’apparie avec T et C s’apparie avec G.',
      },
      {
        id: 'svt3',
        cycle: 'Lycée',
        subject: 'SVT',
        question: 'Quelles cellules du système immunitaire produisent les anticorps ?',
        options: ['A) Les hématies', 'B) Les plasmocytes (issus des lymphocytes B)', 'C) Les plaquettes'],
        correctIndex: 1,
        explanation: 'Les lymphocytes B activés se différencient en plasmocytes sécréteurs d’anticorps.',
      },
    ],
  },
  {
    id: 'ep-info',
    subject: 'Informatique',
    cycle: 'Université',
    examLabel: 'BEPC · BAC · L1–M2',
    durationMinutes: 90,
    coefficient: 3,
    questions: [
      {
        id: 'inf1',
        cycle: 'Collège',
        subject: 'Informatique',
        question: 'Combien de bits contient exactement 1 octet (1 byte) ?',
        options: ['A) 4 bits', 'B) 8 bits', 'C) 16 bits'],
        correctIndex: 1,
        explanation: 'Un octet est composé de 8 bits (valeurs de 0 à 255).',
      },
      {
        id: 'inf2',
        cycle: 'Université',
        subject: 'Informatique',
        question: 'En SQL, quelle clause permet de filtrer les lignes avant regroupement ?',
        options: ['A) WHERE', 'B) ORDER BY', 'C) GROUP BY'],
        correctIndex: 0,
        explanation: 'WHERE filtre les enregistrements bruts, tandis que HAVING filtre après GROUP BY.',
      },
      {
        id: 'inf3',
        cycle: 'Université',
        subject: 'Informatique',
        question: 'Quel protocole assure le chiffrement des échanges sur le Web ?',
        options: ['A) HTTP', 'B) FTP', 'C) HTTPS (TLS)'],
        correctIndex: 2,
        explanation: 'HTTPS repose sur TLS pour chiffrer et authentifier les communications Web.',
      },
    ],
  },
  {
    id: 'ep-histgeo',
    subject: 'Histoire-Géo & ECM',
    cycle: 'Tous',
    examLabel: 'CEP · BEPC · BAC',
    durationMinutes: 90,
    coefficient: 2,
    questions: [
      {
        id: 'hg1',
        cycle: 'All',
        subject: 'Histoire-Géo',
        question: 'Dans quelle région du Cameroun se trouve la ville universitaire de Ngaoundéré ?',
        options: ['A) Extrême-Nord', 'B) Adamaoua', 'C) Nord'],
        correctIndex: 1,
        explanation: 'Ngaoundéré est le chef-lieu de la région de l’Adamaoua, château d’eau du Cameroun.',
      },
      {
        id: 'hg2',
        cycle: 'Collège',
        subject: 'Histoire-Géo',
        question: 'Quelle est la capitale politique du Cameroun ?',
        options: ['A) Yaoundé', 'B) Douala', 'C) Garoua'],
        correctIndex: 0,
        explanation: 'Yaoundé est la capitale politique ; Douala est la capitale économique.',
      },
      {
        id: 'hg3',
        cycle: 'Lycée',
        subject: 'Histoire-Géo',
        question: 'À quelle date le Cameroun oriental a-t-il accédé à l’indépendance ?',
        options: ['A) 1er janvier 1960', 'B) 20 mai 1972', 'C) 1er octobre 1961'],
        correctIndex: 0,
        explanation: 'Le 1er janvier 1960 marque l’indépendance du Cameroun oriental (réunification le 1er oct. 1961).',
      },
    ],
  },
  {
    id: 'ep-philo',
    subject: 'Philosophie',
    cycle: 'Lycée',
    examLabel: 'BAC A · C · D',
    durationMinutes: 180,
    coefficient: 3,
    questions: [
      {
        id: 'ph1',
        cycle: 'Lycée',
        subject: 'Philosophie',
        question: 'Quel est le rôle principal d’une problématique dans l’introduction d’une dissertation ?',
        options: [
          'A) Résumer le cours par cœur',
          'B) Mettre en évidence la tension ou le paradoxe du sujet',
          'C) Donner directement la conclusion',
        ],
        correctIndex: 1,
        explanation: 'La problématique formule le problème philosophique sous-jacent en révélant un paradoxe.',
      },
      {
        id: 'ph2',
        cycle: 'Lycée',
        subject: 'Philosophie',
        question: 'Selon Jean-Paul Sartre, que signifie « l’existence précède l’essence » ?',
        options: [
          'A) L’homme naît d’abord et se définit ensuite par ses choix libres',
          'B) Le destin décide de toute vie humaine',
          'C) La nature humaine est figée avant la naissance',
        ],
        correctIndex: 0,
        explanation: 'Pour l’existentialisme sartrien, l’être humain se construit librement par ses actes.',
      },
      {
        id: 'ph3',
        cycle: 'Lycée',
        subject: 'Philosophie',
        question: 'Dans la philosophie africaine contemporaine, qui est l’auteur de « La Philosophie bantoue » ?',
        options: ['A) Marcien Towa', 'B) Placide Tempels', 'C) Paulin Hountondji'],
        correctIndex: 1,
        explanation: 'Placide Tempels publie La Philosophie bantoue (1945), critiquée ensuite par Towa et Hountondji.',
      },
    ],
  },
  {
    id: 'ep-eco',
    subject: 'Économie & Gestion',
    cycle: 'Université',
    examLabel: 'BAC B/G · Licence · Master',
    durationMinutes: 120,
    coefficient: 3,
    questions: [
      {
        id: 'ec1',
        cycle: 'Lycée',
        subject: 'Économie',
        question: 'En microéconomie, lorsque la demande augmente fortement alors que l’offre reste fixe, le prix d’équilibre :',
        options: ['A) Diminue', 'B) Reste identique', 'C) Augmente'],
        correctIndex: 2,
        explanation: 'Une hausse de la demande à offre constante crée une rareté relative qui pousse le prix à la hausse.',
      },
      {
        id: 'ec2',
        cycle: 'Université',
        subject: 'Comptabilité',
        question: 'Dans un bilan comptable OHADA, l’Actif est toujours égal :',
        options: ['A) Au chiffre d’affaires', 'B) Au Passif (Capitaux propres + Dettes)', 'C) Aux charges'],
        correctIndex: 1,
        explanation: 'Principe fondamental du bilan SYSCOHADA : Total Actif = Total Passif.',
      },
      {
        id: 'ec3',
        cycle: 'Université',
        subject: 'Gestion',
        question: 'Que mesure le PIB (Produit Intérieur Brut) d’un pays ?',
        options: [
          'A) La richesse totale créée sur le territoire en une année',
          'B) Uniquement les exportations agricoles',
          'C) Les recettes fiscales de l’État',
        ],
        correctIndex: 0,
        explanation: 'Le PIB mesure la somme des valeurs ajoutées produites sur le territoire national sur une période.',
      },
    ],
  },
];

export const TIMED_EXAM_QUESTIONS: QuizQuestion[] = EXAM_PAPERS[0].questions;

export function generateSistoReply(
  rawInput: string,
  lang: Language,
  studentName: string,
  classe: string
): string {
  const q = rawInput.toLowerCase().trim();
  const level = getLevelInfo(classe);

  if (q.includes('espagnol') || q.includes('spanish') || q.includes('hola')) {
    if (lang === 'ff') {
      return `Espaniyol ngam ${classe} : "Hola" = Jam tan, "Buenos días" = Jam weeti, "Gracias" = Usoko. Janngu konngol : "Soy ${studentName}, vivo en Camerún."`;
    }
    if (lang === 'en') {
      return `Spanish tip for ${classe}: "Hola" = Hello, "Buenos días" = Good morning, "Gracias" = Thank you. Remember: SER is for identity ("Soy estudiante"), ESTAR is for location or mood ("Estoy bien").`;
    }
    return `Espagnol (${classe}) : « Hola » = Bonjour, « Gracias » = Merci, « ¿Cómo estás? » = Comment vas-tu ? Astuce ${level.exam} : utilise SER pour l’identité (Soy ${studentName}) et ESTAR pour l’état ou le lieu (Estoy en Ngaoundéré).`;
  }

  if (q.includes('math') || q.includes('calcul') || q.includes('pythagore') || q.includes('équation') || q.includes('derivee')) {
    if (lang === 'ff') {
      return `Hiisa (${classe}) : Ngam heɓugo jaabawol moƴƴol, winndu ko anndaaka arande, rewi heen ko laawol. Haa BEPC e BAC, daro e misaalu 3² + 4² = 5².`;
    }
    if (lang === 'en') {
      return `Maths (${classe}): Always write down the given data first, check your units, and verify with a quick estimation. For ${level.cycle}, focus on step-by-step justification—each intermediate line earns points!`;
    }
    return `Maths (${classe} · ${level.exam}) : Commence toujours par poser les données et vérifier les unités. Pour réussir : 1) isole l’inconnue proprement en algèbre, 2) cite le théorème exact en géométrie (Pythagore, Thalès) avant de calculer.`;
  }

  if (q.includes('anglais') || q.includes('english')) {
    if (lang === 'ff') {
      return `Engeleere (${classe}) : "Good morning" = Jam weeti, "I am revising my lessons" = Miɗo jannga jaŋde am. Haal bee cuusal!`;
    }
    if (lang === 'en') {
      return `English (${classe}): Master the 3 core tenses first—Simple Present for habits, Simple Past (yesterday + -ed/irregular) for finished events, and Present Perfect (have/has + past participle). Practice reading aloud 5 minutes daily!`;
    }
    return `Anglais (${classe}) : Maîtrise les 3 temps clés pour le ${level.exam} : Simple Present (habitudes), Simple Past (action passée datée : yesterday I studied) et Present Perfect (have/has + participe passé). Lis une phrase à voix haute !`;
  }

  if (q.includes('bac') || q.includes('bepc') || q.includes('cep') || q.includes('probatoire') || q.includes('examen')) {
    if (lang === 'ff') {
      return `Taskagol ${level.exam} : Janngu hojomaaji 30 nyalawma fuu, waɗ yamɗe krono e Sisto, tawo a fuddita ko weeɓi.`;
    }
    if (lang === 'en') {
      return `${level.exam} Strategy (${classe}): Revise 30 minutes daily with spaced practice, train on our 90-minute timed exam right here, and always start the official paper with the questions you know best.`;
    }
    return `Plan de réussite ${level.exam} (${classe}) : 1) Révise 30 min par jour sans téléphone distracteur, 2) Entraîne-toi avec le Chronomètre Épreuve ci-contre, 3) Commence toujours ta copie par les questions où tu es sûr à 100 % pour sécuriser la moyenne.`;
  }

  if (q.includes('cv') || q.includes('stage') || q.includes('emploi') || q.includes('universit') || q.includes('memoire')) {
    return `Conseil Université & Carrière (${classe}) : Un bon CV tient sur 1 page structurée : En-tête + objectif clair, Formation (ex: Université de Ngaoundéré), Projets chiffrés, Compétences techniques & Langues (Français, Anglais, Fulfulde). Veux-tu ouvrir le cours « Rédiger un CV percutant » ?`;
  }

  if (q.includes('fulfulde') || q.includes('jam')) {
    return `Jam tan ${studentName} ! Miɗo welii e ma. Onon almuuɓe ${classe}, janngen bee tiiɗnaare ngam heɓugo ${level.exam}. Yam yam kala ko njiɗɗaa janngude !`;
  }

  if (lang === 'ff') {
    return `Usoko ${studentName} ! Miɗo heedanii ma ngam ${classe} (${level.exam}). Yam yam dow Espagnol, Maths, Anglais, walla taskagol BAC/BEPC.`;
  }
  if (lang === 'en') {
    return `Great question, ${studentName}! For your ${classe} (${level.exam}) level, try asking me about Spanish, Maths, English, BEPC/BAC exam strategy, or University CV writing.`;
  }
  return `Bien reçu ${studentName} ! Pour ton niveau ${classe} (objectif ${level.exam}), je peux t’aider tout de suite sur : Espagnol, Maths, Anglais, méthode BEPC/BAC, ou CV Université. Clique sur un thème rapide ou pose une question précise.`;
}

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'stu-1',
    studentCode: 'ELV-2026-1042',
    nom: 'Emmanuel',
    phone: '690123456',
    password: '1234',
    classe: '3ème',
    ecole: 'Lycée de Ngaoundéré',
    points: 1250,
    isPremium: true,
    completedCourseIds: ['col-1', 'col-2'],
    studyMinutesToday: 35,
    streakDays: 7,
    lastQuizScore: '16/20 en Espagnol',
    langPref: 'fr',
    voicePref: 'homme',
    blockAfter20h: false,
    eveningSmsEnabled: true,
  },
  {
    id: 'stu-2',
    studentCode: 'ELV-2026-2185',
    nom: 'Aminatou Bello',
    phone: '677234561',
    password: '1234',
    classe: 'Terminale D',
    ecole: 'Lycée de Ngaoundéré',
    points: 980,
    isPremium: true,
    completedCourseIds: ['lyc-1', 'lyc-3'],
    studyMinutesToday: 45,
    streakDays: 12,
    lastQuizScore: '17/20 en Maths',
    langPref: 'fr',
    voicePref: 'femme',
    blockAfter20h: false,
    eveningSmsEnabled: true,
  },
  {
    id: 'stu-3',
    studentCode: 'ELV-2026-3490',
    nom: 'Oumarou Djibrilla',
    phone: '655889900',
    password: '1234',
    classe: 'Licence 2',
    ecole: 'Université de Ngaoundéré',
    points: 840,
    isPremium: false,
    completedCourseIds: ['uni-1'],
    studyMinutesToday: 25,
    streakDays: 4,
    lastQuizScore: '15/20 en Algo',
    langPref: 'ff',
    voicePref: 'homme',
    blockAfter20h: false,
    eveningSmsEnabled: false,
  },
  {
    id: 'stu-4',
    studentCode: 'ELV-2026-4617',
    nom: 'Clarisse Ngo',
    phone: '699112233',
    password: '1234',
    classe: 'CM2',
    ecole: 'École Publique de Dang',
    points: 620,
    isPremium: true,
    completedCourseIds: ['prim-2', 'prim-3'],
    studyMinutesToday: 20,
    streakDays: 5,
    lastQuizScore: '18/20 en Calcul',
    langPref: 'fr',
    voicePref: 'femme',
    blockAfter20h: true,
    eveningSmsEnabled: true,
  },
];

export const INITIAL_PARENTS: ParentRecord[] = [
  {
    id: 'par-1',
    parentCode: 'PAR-2026-4812',
    nom: 'Mme Pauline (Mère d’Emmanuel)',
    studentId: 'stu-1',
    studentName: 'Emmanuel',
    studentPhone: '690123456',
    studentCode: 'ELV-2026-1042',
    connectedAt: '2026-11-19 19:30',
  },
  {
    id: 'par-2',
    parentCode: 'PAR-2026-5920',
    nom: 'M. Bello Hamadou',
    studentId: 'stu-2',
    studentName: 'Aminatou Bello',
    studentPhone: '677234561',
    studentCode: 'ELV-2026-2185',
    connectedAt: '2026-11-19 20:10',
  },
  {
    id: 'par-3',
    parentCode: 'PAR-2026-7304',
    nom: 'Mme Ngo Monique',
    studentId: 'stu-4',
    studentName: 'Clarisse Ngo',
    studentPhone: '699112233',
    studentCode: 'ELV-2026-4617',
    connectedAt: '2026-11-20 18:15',
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    studentPhone: '690123456',
    studentName: 'Emmanuel',
    accountPhone: '690123456',
    amount: 1000,
    method: 'MTN MoMo',
    status: 'confirmé',
    createdAt: '2026-11-18 14:20',
    reference: 'MOMO-2026-841029',
    purpose: 'Abonnement Collège',
  },
  {
    id: 'pay-2',
    studentPhone: '677234561',
    studentName: 'Aminatou Bello',
    accountPhone: '677234561',
    amount: 1500,
    method: 'Orange Money',
    status: 'confirmé',
    createdAt: '2026-11-19 09:05',
    reference: 'OM-2026-593174',
    purpose: 'Abonnement Lycée',
  },
  {
    id: 'pay-3',
    studentPhone: '699112233',
    studentName: 'Clarisse Ngo',
    accountPhone: '699112233',
    amount: 500,
    method: 'MTN MoMo',
    status: 'confirmé',
    createdAt: '2026-11-19 10:30',
    reference: 'MOMO-2026-412095',
    purpose: 'Abonnement Primaire',
  },
  {
    id: 'pay-4',
    studentPhone: '690123456',
    studentName: 'Emmanuel',
    accountPhone: '690123456',
    amount: 2000,
    method: 'Orange Money',
    status: 'confirmé',
    createdAt: '2026-11-12 11:15',
    reference: 'OM-2026-771234',
    purpose: 'Certificat · Espagnol LV2 · BEPC',
    certificateId: 'cert-1',
  },
  {
    id: 'pay-5',
    studentPhone: '677234561',
    studentName: 'Aminatou Bello',
    accountPhone: '677234561',
    amount: 2000,
    method: 'Orange Money',
    status: 'à_vérifier',
    createdAt: '2026-11-19 15:40',
    reference: 'OM-2026-908412',
    purpose: 'Certificat · Analyse & Probabilités BAC',
    certificateId: 'cert-2',
  },
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-1',
    code: 'CERT-2026-123456',
    studentPhone: '690123456',
    studentName: 'Emmanuel',
    classe: '3ème',
    subject: 'Espagnol LV2 · BEPC',
    score: '16/20',
    status: 'validé',
    paymentConfirmed: true,
    paymentId: 'pay-4',
    issuedAt: '2026-11-12',
  },
  {
    id: 'cert-2',
    code: 'CERT-2026-204819',
    studentPhone: '677234561',
    studentName: 'Aminatou Bello',
    classe: 'Terminale D',
    subject: 'Analyse & Probabilités BAC',
    score: '17/20',
    status: 'en_attente',
    paymentConfirmed: false,
    paymentId: 'pay-5',
    issuedAt: '2026-11-19',
  },
];

export const INITIAL_ASSIGNMENTS: AssignmentRecord[] = [
  {
    id: 'asg-1',
    schoolName: 'Lycée de Ngaoundéré',
    title: 'Exercices 1 à 4 — Théorème de Pythagore (Fiche BEPC)',
    classe: '3ème',
    dueDate: 'Demain · 08:00',
    createdAt: 'Aujourd’hui',
  },
  {
    id: 'asg-2',
    schoolName: 'Lycée de Ngaoundéré',
    title: 'Dialogue en Espagnol : Se présenter en classe',
    classe: '3ème',
    dueDate: 'Vendredi · 10:00',
    createdAt: 'Hier',
  },
];
