export type Language = 'fr' | 'ff' | 'en';

export type EducationCycle = 'Primaire' | 'Collège' | 'Lycée' | 'Université';

export type VoicePersona = 'homme' | 'femme';

export type ActivePage =
  | 'login'
  | 'app'
  | 'paiement'
  | 'profil'
  | 'parent'
  | 'ecole'
  | 'admin';

export interface StudentRecord {
  id: string;
  studentCode: string;
  nom: string;
  phone: string;
  password: string;
  classe: string;
  ecole: string;
  points: number;
  isPremium: boolean;
  completedCourseIds: string[];
  studyMinutesToday: number;
  streakDays: number;
  lastQuizScore: string;
  langPref: Language;
  voicePref: VoicePersona;
  blockAfter20h: boolean;
  eveningSmsEnabled: boolean;
  preferredPaymentMethod?: 'MTN MoMo' | 'Orange Money';
}

export interface ParentRecord {
  id: string;
  parentCode: string;
  nom: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentCode: string;
  connectedAt: string;
}

export interface PaymentRecord {
  id: string;
  studentPhone: string;
  studentName: string;
  accountPhone?: string;
  amount: number;
  method: 'MTN MoMo' | 'Orange Money';
  status: 'confirmé' | 'à_vérifier' | 'en_attente';
  createdAt: string;
  reference?: string;
  purpose?: string;
  certificateId?: string;
}

export interface CertificateRecord {
  id: string;
  code: string;
  studentPhone: string;
  studentName: string;
  classe: string;
  subject: string;
  score: string;
  status: 'validé' | 'en_attente';
  paymentConfirmed: boolean;
  paymentId?: string;
  issuedAt: string;
}

export interface AssignmentRecord {
  id: string;
  schoolName: string;
  title: string;
  classe: string;
  dueDate: string;
  createdAt: string;
}

export interface CourseItem {
  id: string;
  cycle: EducationCycle;
  subject: string;
  title: string;
  durationMin: number;
  summary: string;
  keyPoints: string[];
  spokenScript: string;
}

export interface QuizQuestion {
  id: string;
  cycle: EducationCycle | 'All';
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExamPaper {
  id: string;
  subject: string;
  cycle: EducationCycle | 'Tous';
  examLabel: string;
  durationMinutes: number;
  coefficient: number;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'sisto' | 'user';
  text: string;
  timestamp: string;
}
