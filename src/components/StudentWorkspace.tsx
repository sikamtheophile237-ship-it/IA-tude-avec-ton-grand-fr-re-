import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Mic,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Send,
  Square,
  Volume2,
} from 'lucide-react';
import {
  COURSES,
  EXAM_PAPERS,
  generateSistoReply,
  getLevelInfo,
  QUICK_QUIZZES,
  TRANSLATIONS,
} from '../data/curriculum';
import {useSpeech} from '../hooks/useSpeech';
import {CertificatePrintModal} from './CertificatePrintModal';
import {
  ActivePage,
  AssignmentRecord,
  CertificateRecord,
  ChatMessage,
  CourseItem,
  EducationCycle,
  Language,
  PaymentRecord,
  StudentRecord,
  VoicePersona,
} from '../types';

interface StudentWorkspaceProps {
  student: StudentRecord;
  lang: Language;
  voiceMuted: boolean;
  assignments: AssignmentRecord[];
  certificates: CertificateRecord[];
  payments: PaymentRecord[];
  onAwardPoints: (delta: number, note?: string) => void;
  onToggleCourseComplete: (courseId: string) => void;
  onChangeVoicePersona: (persona: VoicePersona) => void;
  onRequestCertificate: (
    subject: string
  ) => {ok: boolean; certificateId?: string; message: string};
  onGoToCertPayment: (certId: string, subject: string) => void;
  onNavigate: (page: ActivePage) => void;
}

function formatSeconds(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  student,
  lang,
  voiceMuted,
  assignments,
  certificates,
  payments,
  onAwardPoints,
  onToggleCourseComplete,
  onChangeVoicePersona,
  onRequestCertificate,
  onGoToCertPayment,
  onNavigate,
}) => {
  const t = TRANSLATIONS[lang];
  const levelInfo = getLevelInfo(student.classe);
  const {isSpeaking, isListening, speechNote, speak, stopSpeaking, startListening} =
    useSpeech(lang, student.voicePref, voiceMuted);

  // Chat with Sisto
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'sisto',
      text: `Salut ${student.nom} ! Je suis Sisto, ton grand frère. Pose-moi une question sur Espagnol, Maths, Anglais, ${levelInfo.exam} ou CV, ou parle-moi au micro.`,
      timestamp: 'Maintenant',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const sendMessage = (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean) return;

    const nowLabel = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: nowLabel,
    };

    const replyText = generateSistoReply(clean, lang, student.nom, student.classe);
    const sistoMsg: ChatMessage = {
      id: `s-${Date.now() + 1}`,
      sender: 'sisto',
      text: replyText,
      timestamp: nowLabel,
    };

    setMessages((prev) => [...prev, userMsg, sistoMsg]);
    setChatInput('');
    onAwardPoints(5);
    speak(replyText);
  };

  const lastSistoMessage = useMemo(() => {
    const found = [...messages].reverse().find((m) => m.sender === 'sisto');
    return found?.text || '';
  }, [messages]);

  // Courses & Cycle filter
  const [cycleFilter, setCycleFilter] = useState<EducationCycle>(levelInfo.cycle);
  const filteredCourses = useMemo(
    () => COURSES.filter((c) => c.cycle === cycleFilter),
    [cycleFilter]
  );
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  const totalCoursesInCycle = filteredCourses.length || 1;
  const completedInCycle = filteredCourses.filter((c) =>
    student.completedCourseIds.includes(c.id)
  ).length;
  const progressPct = Math.round((completedInCycle / totalCoursesInCycle) * 100);

  // Quick Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const activeQuiz = QUICK_QUIZZES[quizIdx % QUICK_QUIZZES.length];

  const handleQuizAnswer = (idx: number) => {
    if (quizChoice !== null) return;
    setQuizChoice(idx);
    if (idx === activeQuiz.correctIndex) {
      onAwardPoints(10);
    }
  };

  const handleNextQuiz = () => {
    setQuizChoice(null);
    setQuizIdx((prev) => (prev + 1) % QUICK_QUIZZES.length);
  };

  // Timed Exam state across all subjects
  const [selectedPaperId, setSelectedPaperId] = useState<string>(EXAM_PAPERS[0].id);
  const activePaper = useMemo(
    () => EXAM_PAPERS.find((p) => p.id === selectedPaperId) || EXAM_PAPERS[0],
    [selectedPaperId]
  );
  const [secondsLeft, setSecondsLeft] = useState(EXAM_PAPERS[0].durationMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [examIdx, setExamIdx] = useState(0);
  const [examChoice, setExamChoice] = useState<number | null>(null);
  const [examScore, setExamScore] = useState(0);
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const handleSelectPaper = (paperId: string) => {
    const nextPaper = EXAM_PAPERS.find((p) => p.id === paperId) || EXAM_PAPERS[0];
    setSelectedPaperId(nextPaper.id);
    setSecondsLeft(nextPaper.durationMinutes * 60);
    setTimerRunning(false);
    setExamIdx(0);
    setExamChoice(null);
    setExamScore(0);
    setExamFinished(false);
  };

  const activeExamQ = activePaper.questions[examIdx % activePaper.questions.length];

  const handleExamAnswer = (idx: number) => {
    if (examChoice !== null || examFinished) return;
    if (!timerRunning) setTimerRunning(true);
    setExamChoice(idx);
    if (idx === activeExamQ.correctIndex) {
      setExamScore((prev) => prev + 1);
      onAwardPoints(15);
    }
  };

  const handleAdvanceExam = () => {
    if (examIdx + 1 >= activePaper.questions.length) {
      setExamFinished(true);
      setTimerRunning(false);
      onAwardPoints(20);
      return;
    }
    setExamChoice(null);
    setExamIdx((i) => i + 1);
  };

  // Certificate request feedback
  const [certFeedback, setCertFeedback] = useState('');
  const [certSubject, setCertSubject] = useState(`${levelInfo.exam} · Synthèse Générale`);
  const [printingCert, setPrintingCert] = useState<CertificateRecord | null>(null);

  const unlockedCertificates = useMemo(
    () => certificates.filter((c) => c.paymentConfirmed && c.status === 'validé'),
    [certificates]
  );
  const pendingCertificates = useMemo(
    () => certificates.filter((c) => !(c.paymentConfirmed && c.status === 'validé')),
    [certificates]
  );

  const handleRequestCert = () => {
    const res = onRequestCertificate(certSubject);
    setCertFeedback(res.message);
  };

  // Parent 20h bedtime guard check
  const currentHour = new Date().getHours();
  const isBedtimeBlocked = student.blockAfter20h && currentHour >= 20;

  if (isBedtimeBlocked) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-violet-200 bg-white p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Pause nocturne activée par tes parents</h2>
          <p className="mt-3 text-sm text-slate-600">
            Le contrôle parental limite l’accès après 20h00 pour te permettre de bien dormir avant
            les cours de demain. Tu peux ajuster ce réglage dans l’Espace Parents.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('parent')}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Ouvrir l’Espace Parents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-24 md:pb-10">
      {/* Student Header Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium text-blue-200">
              {student.classe} · {levelInfo.cycle} · Objectif {levelInfo.exam} ·{' '}
              {student.isPremium ? 'Accès Premium actif' : 'Compte Découverte'}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.hello} {student.nom}
            </h1>
            <p className="mt-1 text-xs text-blue-100">
              Code élève attribué :{' '}
              <span className="font-mono font-bold text-white tabular-nums">
                {student.studentCode}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-blue-200">Points cumulés</p>
              <p className="font-mono text-2xl font-bold text-white tabular-nums">
                {student.points} pts
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Voix de Sisto</p>
              <select
                aria-label="Choisir la voix de Sisto"
                value={student.voicePref}
                onChange={(e) => onChangeVoicePersona(e.target.value as VoicePersona)}
                className="mt-0.5 min-h-[36px] rounded-lg border border-blue-700 bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-white focus:outline-none"
              >
                <option value="homme">Grand Frère</option>
                <option value="femme">Grande Sœur</option>
              </select>
            </div>
            {!student.isPremium && (
              <button
                type="button"
                onClick={() => onNavigate('paiement')}
                className="min-h-[42px] rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                {t.goPremium} · {levelInfo.price}F/mois
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Two-Column Desktop Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Stage (7 cols): Voice Tutor + Offline Courses + Homework */}
        <div className="lg:col-span-7 space-y-6">
          {/* Voice & Chat Tutor */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/tutor_sisto_avatar_1795124969230.jpg"
                  alt="Portrait de Sisto ton mentor"
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t.discussTitle}</h2>
                  <p className="text-xs text-slate-500">
                    Tuteur vocal hors-ligne · {student.voicePref === 'homme' ? 'Grand Frère' : 'Grande Sœur'}
                  </p>
                </div>
              </div>
              {isSpeaking && (
                <span className="text-xs font-semibold text-blue-700">Lecture audio active</span>
              )}
            </div>

            <div className="mt-4 h-64 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-700 text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.sender === 'sisto' && (
                      <button
                        type="button"
                        onClick={() => speak(msg.text, true)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
                      >
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Écouter</span>
                      </button>
                    )}
                  </div>
                  <span className="mt-1 px-1 font-mono text-[11px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(chatInput);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.askPlaceholder}
                className="flex-1 min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shrink-0"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{t.send}</span>
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startListening((txt) => sendMessage(txt))}
                className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                  isListening
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isListening ? 'Écoute en cours...' : t.speakToSisto}</span>
              </button>
              <button
                type="button"
                onClick={() => speak(lastSistoMessage, true)}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.listenSisto}</span>
              </button>
              <button
                type="button"
                onClick={stopSpeaking}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Square className="h-3 w-3" aria-hidden="true" />
                <span>{t.stopVoice}</span>
              </button>
            </div>

            {speechNote && (
              <p className="mt-2 text-xs text-slate-600">{speechNote}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">Thèmes rapides :</span>
              {(['Espagnol', 'Maths', 'Anglais', 'BAC / BEPC', 'CV Université'] as const).map(
                (topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => sendMessage(topic)}
                    className="min-h-[34px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {topic}
                  </button>
                )
              )}
            </div>
          </section>

          {/* Offline Courses Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.myCourses}</h2>
                <p className="text-xs text-slate-500">
                  {t.offlineReady} · Progression {cycleFilter} :{' '}
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {progressPct}% ({completedInCycle}/{totalCoursesInCycle})
                  </span>
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-100 p-1 overflow-x-auto">
                {(['Primaire', 'Collège', 'Lycée', 'Université'] as EducationCycle[]).map(
                  (cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => {
                        setCycleFilter(cycle);
                        setSelectedCourse(null);
                      }}
                      className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                        cycleFilter === cycle
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cycle}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{width: `${progressPct}%`}}
              />
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {filteredCourses.map((course) => {
                const isDone = student.completedCourseIds.includes(course.id);
                const isOpen = selectedCourse?.id === course.id;
                return (
                  <div key={course.id} className="py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(isOpen ? null : course)}
                        className="text-left flex-1 group"
                      >
                        <p className="text-xs font-medium text-slate-500">
                          {course.subject} · {course.durationMin} min ·{' '}
                          {isDone ? 'Terminé' : 'À réviser'}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {course.title}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleCourseComplete(course.id)}
                        className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold shrink-0 transition-colors ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isDone ? 'Validé' : 'Terminer'}</span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <p className="text-sm text-slate-700 leading-relaxed">{course.summary}</p>
                        <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                          {course.keyPoints.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => speak(course.spokenScript, true)}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                          >
                            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Écouter l’explication de Sisto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCourse(null)}
                            className="inline-flex min-h-[38px] items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Fermer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Assignments from School Portal */}
          {assignments.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <h2 className="text-base font-bold text-slate-900">Devoirs de l’établissement</h2>
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                {assignments.map((asg) => (
                  <div key={asg.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        {asg.schoolName} · {asg.classe} · Échéance : {asg.dueDate}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{asg.title}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 shrink-0">{asg.createdAt}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Deck (5 cols): Quick Quiz, Timed Exam, Certificates */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Quiz */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">{t.quickQuiz}</h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {activeQuiz.subject} · Question {(quizIdx % QUICK_QUIZZES.length) + 1}/
                {QUICK_QUIZZES.length}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-900">{activeQuiz.question}</p>

            <div className="mt-3 space-y-2">
              {activeQuiz.options.map((opt, idx) => {
                const isSelected = quizChoice === idx;
                const isCorrect = idx === activeQuiz.correctIndex;
                let style = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                if (quizChoice !== null) {
                  if (isCorrect) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                  } else if (isSelected) {
                    style = 'border-red-400 bg-red-50 text-red-900';
                  }
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleQuizAnswer(idx)}
                    className={`w-full min-h-[44px] rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizChoice !== null && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <p
                  className={`text-xs font-bold ${
                    quizChoice === activeQuiz.correctIndex ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {quizChoice === activeQuiz.correctIndex
                    ? 'Bonne réponse (+10 points gagnés)'
                    : 'Réponse incorrecte'}
                </p>
                <p className="text-xs text-slate-700">{activeQuiz.explanation}</p>
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="inline-flex min-h-[38px] items-center rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Question suivante
                </button>
              </div>
            )}
          </section>

          {/* Timed BEPC / BAC / Université Exams — All Subjects */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Épreuves — Toutes les Matières</h2>
                <p className="text-xs text-slate-500">
                  {activePaper.examLabel} · Coeff. {activePaper.coefficient} ·{' '}
                  {activePaper.durationMinutes} min
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 font-mono text-base font-bold text-blue-900 tabular-nums shrink-0">
                <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />
                <span>{formatSeconds(secondsLeft)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="examSubjectSelect" className="block text-xs font-semibold text-slate-700">
                Choisis la matière de l’épreuve ({EXAM_PAPERS.length} matières)
              </label>
              <select
                id="examSubjectSelect"
                value={selectedPaperId}
                onChange={(e) => handleSelectPaper(e.target.value)}
                className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {EXAM_PAPERS.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.subject} ({paper.examLabel})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {EXAM_PAPERS.map((paper) => (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => handleSelectPaper(paper.id)}
                  className={`min-h-[32px] rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    paper.id === selectedPaperId
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {paper.subject}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {timerRunning ? (
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{timerRunning ? 'Pause' : 'Démarrer chrono'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPaper(selectedPaperId)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Réinitialiser</span>
                </button>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                Score : {examScore}/{activePaper.questions.length}
              </span>
            </div>

            {examFinished ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <p className="text-sm font-bold text-emerald-900">
                  Épreuve de {activePaper.subject} terminée !
                </p>
                <p className="text-xs text-emerald-800">
                  Résultat :{' '}
                  <strong className="font-mono">
                    {Math.round((examScore / activePaper.questions.length) * 20)}/20
                  </strong>{' '}
                  ({examScore} bonne(s) réponse(s) sur {activePaper.questions.length} · +20 pts bonus).
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectPaper(selectedPaperId)}
                  className="inline-flex min-h-[38px] items-center rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Refaire cette épreuve
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500">
                    {activeExamQ.subject} · Question {examIdx + 1}/{activePaper.questions.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => speak(activeExamQ.question, true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Écouter</span>
                  </button>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">{activeExamQ.question}</p>

                <div className="mt-3 space-y-2">
                  {activeExamQ.options.map((opt, idx) => {
                    const isSelected = examChoice === idx;
                    const isCorrect = idx === activeExamQ.correctIndex;
                    let style = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                    if (examChoice !== null) {
                      if (isCorrect) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                      } else if (isSelected) {
                        style = 'border-red-400 bg-red-50 text-red-900';
                      }
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleExamAnswer(idx)}
                        className={`w-full min-h-[42px] rounded-xl border px-3.5 py-2 text-left text-sm transition-colors ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {examChoice !== null && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <p
                      className={`text-xs font-bold ${
                        examChoice === activeExamQ.correctIndex
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {examChoice === activeExamQ.correctIndex
                        ? 'Bonne réponse (+15 points)'
                        : 'À revoir'}
                    </p>
                    <p className="text-xs text-slate-700">{activeExamQ.explanation}</p>
                    <button
                      type="button"
                      onClick={handleAdvanceExam}
                      className="inline-flex min-h-[36px] items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      {examIdx + 1 >= activePaper.questions.length
                        ? 'Voir ma note /20'
                        : 'Question suivante'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Certificates */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <img
                src="/src/assets/images/badge_certificate_seal_1795124968930.jpg"
                alt="Sceau officiel certificat SISTO MASTER"
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.certificates}</h2>
                <p className="text-xs text-slate-600">
                  Obtiens un certificat vérifié pour ton dossier scolaire ou universitaire (2000F).
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <label htmlFor="certSubject" className="block text-xs font-semibold text-slate-700">
                Matière / Mention demandée
              </label>
              <select
                id="certSubject"
                value={certSubject}
                onChange={(e) => setCertSubject(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value={`${levelInfo.exam} · Synthèse Générale`}>
                  {levelInfo.exam} · Synthèse Générale
                </option>
                <option value="Espagnol LV2 · Maîtrise">Espagnol LV2 · Maîtrise</option>
                <option value="Mathématiques · Excellence">Mathématiques · Excellence</option>
                <option value="Anglais Académique">Anglais Académique</option>
                <option value="Insertion Pro & CV">Insertion Pro & CV</option>
              </select>

              <button
                type="button"
                onClick={handleRequestCert}
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
              >
                <Award className="h-4 w-4" aria-hidden="true" />
                <span>Demander un Certificat (2000F)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const firstUnpaid = pendingCertificates.find(
                    (c) => !payments.some((p) => p.id === c.paymentId || p.certificateId === c.id)
                  );
                  onGoToCertPayment(
                    firstUnpaid?.id || '',
                    firstUnpaid?.subject || certSubject
                  );
                }}
                className="inline-flex w-full min-h-[40px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Payer 2000F via Orange Money ou MTN MoMo
              </button>

              {certFeedback && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
                  {certFeedback}
                </p>
              )}

              {/* Unlocked certificates: ONLY shown after payment AND admin money confirmation */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                {unlockedCertificates.length === 0 ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Aucun certificat affiché pour le moment. Les certificats apparaissent ici dès que
                    tu as payé 2000F et que l’administrateur confirme que l’argent est arrivé.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      Certificats délivrés ({unlockedCertificates.length})
                    </p>
                    {unlockedCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {cert.subject}
                          </p>
                          <p className="font-mono text-[11px] text-slate-600">
                            {cert.code} · {cert.score}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPrintingCert(cert)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
                          >
                            <Printer className="h-3 w-3" aria-hidden="true" />
                            <span>Imprimer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('profil')}
                            className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50"
                          >
                            Profil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pendingCertificates.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-semibold text-slate-600">
                      Demandes en attente :
                    </p>
                    {pendingCertificates.map((cert) => {
                      const linkedPay = payments.find(
                        (p) => p.id === cert.paymentId || p.certificateId === cert.id
                      );
                      return (
                        <div
                          key={cert.id}
                          className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{cert.subject}</p>
                            <p className="text-[11px] text-amber-800">
                              {!linkedPay
                                ? 'Paiement de 2000F requis'
                                : linkedPay.status === 'en_attente'
                                  ? 'Paiement hors-ligne (à synchroniser)'
                                  : `Payé (${linkedPay.method}) · En attente confirmation admin`}
                            </p>
                          </div>
                          {!linkedPay && (
                            <button
                              type="button"
                              onClick={() => onGoToCertPayment(cert.id, cert.subject)}
                              className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 shrink-0"
                            >
                              Payer
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <CertificatePrintModal
        certificate={printingCert}
        schoolName={student.ecole}
        onClose={() => setPrintingCert(null)}
      />
    </div>
  );
};
