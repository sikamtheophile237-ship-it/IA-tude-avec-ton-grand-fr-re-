import {useEffect, useMemo, useState} from 'react';
import {AdminView} from './components/AdminView';
import {AuthLanding} from './components/AuthLanding';
import {ParentView} from './components/ParentView';
import {PaymentView} from './components/PaymentView';
import {ProfileView} from './components/ProfileView';
import {SchoolView} from './components/SchoolView';
import {StudentWorkspace} from './components/StudentWorkspace';
import {TopBar} from './components/TopBar';
import {WorkspaceToolbar} from './components/WorkspaceToolbar';
import {
  generateUniqueCode,
  INITIAL_ASSIGNMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_PARENTS,
  INITIAL_PAYMENTS,
  INITIAL_STUDENTS,
} from './data/curriculum';
import {useOnlineStatus, usePWAInstall} from './hooks/usePWAInstall';
import {
  ActivePage,
  AssignmentRecord,
  CertificateRecord,
  Language,
  ParentRecord,
  PaymentRecord,
  StudentRecord,
  VoicePersona,
} from './types';

interface PersistedState {
  students: StudentRecord[];
  parents: ParentRecord[];
  payments: PaymentRecord[];
  certificates: CertificateRecord[];
  assignments: AssignmentRecord[];
  activeStudentId: string | null;
  activeParentId: string | null;
  parentChildId: string;
  activeSchoolName: string;
  isAdminLoggedIn: boolean;
  lang: Language;
  voiceMuted: boolean;
  offlinePackSaved: boolean;
  pendingPointsCount: number;
}

const STORAGE_KEY = 'sisto_master_v3_state';

function loadInitialState(): PersistedState {
  const defaults: PersistedState = {
    students: INITIAL_STUDENTS,
    parents: INITIAL_PARENTS,
    payments: INITIAL_PAYMENTS,
    certificates: INITIAL_CERTIFICATES,
    assignments: INITIAL_ASSIGNMENTS,
    activeStudentId: null,
    activeParentId: null,
    parentChildId: INITIAL_STUDENTS[0].id,
    activeSchoolName: 'Lycée de Ngaoundéré',
    isAdminLoggedIn: false,
    lang: 'fr',
    voiceMuted: false,
    offlinePackSaved: false,
    pendingPointsCount: 0,
  };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    const usedStudentCodes = new Set<string>();
    const migratedStudents = (
      parsed.students?.length ? parsed.students : defaults.students
    ).map((s) => {
      const code = s.studentCode || generateUniqueCode('ELV', usedStudentCodes);
      usedStudentCodes.add(code);
      return {...s, studentCode: code};
    });

    const usedParentCodes = new Set<string>();
    const migratedParents = (parsed.parents || defaults.parents).map((p) => {
      const code = p.parentCode || generateUniqueCode('PAR', usedParentCodes);
      usedParentCodes.add(code);
      return {...p, parentCode: code};
    });

    const migratedCerts = (parsed.certificates || defaults.certificates).map((c) => ({
      ...c,
      paymentConfirmed:
        typeof c.paymentConfirmed === 'boolean'
          ? c.paymentConfirmed
          : c.status === 'validé',
    }));
    return {
      ...defaults,
      ...parsed,
      students: migratedStudents,
      parents: migratedParents,
      payments: parsed.payments || defaults.payments,
      certificates: migratedCerts,
      assignments: parsed.assignments || defaults.assignments,
    };
  } catch {
    return defaults;
  }
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const init = loadInitialState();
    if (init.isAdminLoggedIn) return 'admin';
    if (init.activeStudentId) return 'app';
    return 'login';
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{
    type: 'abonnement' | 'certificat';
    certificateId?: string;
    subject?: string;
  } | null>(null);

  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const {isOnline, simulatedOffline, toggleSimulatedOffline} = useOnlineStatus();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  useEffect(() => {
    if (!toastMsg) return;
    const id = window.setTimeout(() => setToastMsg(null), 3500);
    return () => window.clearTimeout(id);
  }, [toastMsg]);

  const activeStudent = useMemo(
    () => state.students.find((s) => s.id === state.activeStudentId) || null,
    [state.activeStudentId, state.students]
  );

  const parentChild = useMemo(
    () =>
      state.students.find((s) => s.id === state.parentChildId) || state.students[0],
    [state.parentChildId, state.students]
  );

  const activeParent = useMemo(() => {
    if (state.activeParentId) {
      const byId = state.parents.find((p) => p.id === state.activeParentId);
      if (byId) return byId;
    }
    return state.parents.find((p) => p.studentId === parentChild.id) || null;
  }, [parentChild.id, state.activeParentId, state.parents]);

  const pendingPaymentsCount = useMemo(
    () => state.payments.filter((p) => p.status === 'en_attente').length,
    [state.payments]
  );

  const showInstallButton = !isInstalled && (isInstallable || isIOS);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setToastMsg('SISTO MASTER a été installé sur ton appareil.');
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleLoginStudent = (identifier: string, pass: string): string | null => {
    const cleanId = identifier.trim();
    const found = state.students.find(
      (s) =>
        (s.phone === cleanId ||
          s.studentCode.toLowerCase() === cleanId.toLowerCase()) &&
        s.password === pass
    );
    if (!found) {
      return 'Numéro / code élève ou mot de passe incorrect. Démo : 690123456 / 1234.';
    }
    const assignedCode =
      found.studentCode ||
      generateUniqueCode(
        'ELV',
        state.students.map((s) => s.studentCode)
      );
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === found.id ? {...s, studentCode: assignedCode} : s
      ),
      activeStudentId: found.id,
      parentChildId: found.id,
      lang: found.langPref,
    }));
    setActivePage('app');
    setToastMsg(`Connecté : ${found.nom} · Code élève : ${assignedCode}`);
    return null;
  };

  const handleRegisterStudent = (payload: {
    nom: string;
    phone: string;
    password: string;
    classe: string;
    enableVoice: boolean;
  }): string | null => {
    if (state.students.some((s) => s.phone === payload.phone)) {
      return 'Un compte existe déjà avec ce numéro de téléphone.';
    }
    const studentCode = generateUniqueCode(
      'ELV',
      state.students.map((s) => s.studentCode)
    );
    const newStudent: StudentRecord = {
      id: `stu-${Date.now()}`,
      studentCode,
      nom: payload.nom,
      phone: payload.phone,
      password: payload.password,
      classe: payload.classe,
      ecole: 'Lycée de Ngaoundéré',
      points: 50,
      isPremium: false,
      completedCourseIds: [],
      studyMinutesToday: 5,
      streakDays: 1,
      lastQuizScore: 'Nouveau compte',
      langPref: state.lang,
      voicePref: 'homme',
      blockAfter20h: false,
      eveningSmsEnabled: true,
    };
    setState((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
      activeStudentId: newStudent.id,
      parentChildId: newStudent.id,
      voiceMuted: !payload.enableVoice,
    }));
    setActivePage('app');
    setToastMsg(
      `Bienvenue ${payload.nom} ! Code attribué : ${studentCode} · +50 points crédités.`
    );
    return null;
  };

  const connectParentRecord = (
    targetStudent: StudentRecord,
    parentNameInput?: string
  ): ParentRecord => {
    const cleanName = parentNameInput?.trim() || '';
    const existingByNameAndStudent = cleanName
      ? state.parents.find(
          (p) =>
            p.studentId === targetStudent.id &&
            p.nom.toLowerCase() === cleanName.toLowerCase()
        )
      : state.parents.find((p) => p.studentId === targetStudent.id);

    const nowLabel = new Date().toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    if (existingByNameAndStudent) {
      const updated: ParentRecord = {
        ...existingByNameAndStudent,
        studentName: targetStudent.nom,
        studentPhone: targetStudent.phone,
        studentCode: targetStudent.studentCode,
        connectedAt: nowLabel,
      };
      setState((prev) => ({
        ...prev,
        parents: prev.parents.map((p) => (p.id === updated.id ? updated : p)),
        parentChildId: targetStudent.id,
        activeParentId: updated.id,
      }));
      return updated;
    }

    const parentCode = generateUniqueCode(
      'PAR',
      state.parents.map((p) => p.parentCode)
    );
    const created: ParentRecord = {
      id: `par-${Date.now()}`,
      parentCode,
      nom: cleanName || `Parent de ${targetStudent.nom}`,
      studentId: targetStudent.id,
      studentName: targetStudent.nom,
      studentPhone: targetStudent.phone,
      studentCode: targetStudent.studentCode,
      connectedAt: nowLabel,
    };
    setState((prev) => ({
      ...prev,
      parents: [created, ...prev.parents],
      parentChildId: targetStudent.id,
      activeParentId: created.id,
    }));
    return created;
  };

  const handleOpenParent = (
    phoneOrCode: string,
    parentName?: string
  ): string | null => {
    const query = phoneOrCode.trim();
    const matchedParentByCode = state.parents.find(
      (p) => p.parentCode.toLowerCase() === query.toLowerCase()
    );
    const target = matchedParentByCode
      ? state.students.find((s) => s.id === matchedParentByCode.studentId)
      : state.students.find(
          (s) =>
            s.phone === query ||
            s.studentCode.toLowerCase() === query.toLowerCase()
        );

    if (!target) {
      return 'Aucun élève trouvé avec ce numéro ou code. Essaie 690123456.';
    }
    const parentRec = connectParentRecord(
      target,
      parentName || matchedParentByCode?.nom
    );
    setActivePage('parent');
    setToastMsg(
      `Parent connecté : ${parentRec.nom} · Code attribué : ${parentRec.parentCode}`
    );
    return null;
  };

  const handleOpenSchool = (schoolName: string) => {
    setState((prev) => ({...prev, activeSchoolName: schoolName}));
    setActivePage('ecole');
  };

  const handleLoginAdmin = (
    phone: string,
    pass: string,
    secret: string
  ): string | null => {
    if (
      phone !== '690123456' ||
      pass !== 'admin2026' ||
      secret !== 'SISTO-ADMIN-2026'
    ) {
      return 'Identifiants Super Admin invalides.';
    }
    setState((prev) => ({...prev, isAdminLoggedIn: true}));
    setActivePage('admin');
    return null;
  };

  const handleLogout = () => {
    setState((prev) => ({
      ...prev,
      activeStudentId: null,
      activeParentId: null,
      isAdminLoggedIn: false,
    }));
    setActivePage('login');
  };

  const handleAwardPoints = (delta: number) => {
    if (!activeStudent) return;
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === activeStudent.id
          ? {
              ...s,
              points: s.points + delta,
              studyMinutesToday: s.studyMinutesToday + 2,
            }
          : s
      ),
      pendingPointsCount: isOnline
        ? prev.pendingPointsCount
        : prev.pendingPointsCount + delta,
    }));
  };

  const handleToggleCourseComplete = (courseId: string) => {
    if (!activeStudent) return;
    const alreadyDone = activeStudent.completedCourseIds.includes(courseId);
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id !== activeStudent.id) return s;
        const nextIds = alreadyDone
          ? s.completedCourseIds.filter((id) => id !== courseId)
          : [...s.completedCourseIds, courseId];
        return {
          ...s,
          completedCourseIds: nextIds,
          points: alreadyDone ? Math.max(0, s.points - 15) : s.points + 15,
        };
      }),
      pendingPointsCount:
        !isOnline && !alreadyDone
          ? prev.pendingPointsCount + 15
          : prev.pendingPointsCount,
    }));
  };

  const handleChangeVoicePersona = (persona: VoicePersona) => {
    if (!activeStudent) return;
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === activeStudent.id ? {...s, voicePref: persona} : s
      ),
    }));
  };

  const handleRequestCertificate = (subject: string) => {
    if (!activeStudent) {
      return {ok: false, message: 'Connecte-toi pour demander un certificat.'};
    }
    const newCert: CertificateRecord = {
      id: `cert-${Date.now()}`,
      code: `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      studentPhone: activeStudent.phone,
      studentName: activeStudent.nom,
      classe: activeStudent.classe,
      subject,
      score: '16/20',
      status: 'en_attente',
      paymentConfirmed: false,
      issuedAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      certificates: [newCert, ...prev.certificates],
    }));
    return {
      ok: true,
      certificateId: newCert.id,
      message: `Demande enregistrée (${newCert.code}). Paye 2000F via Orange Money ou MTN MoMo, puis le certificat s’affichera dès que l’administrateur confirmera l’arrivée de l’argent.`,
    };
  };

  const handleProcessPayment = (payload: {
    amount: number;
    method: 'MTN MoMo' | 'Orange Money';
    phone: string;
    pin: string;
    purpose: string;
    accountPhone?: string;
    isCertificate?: boolean;
    certificateId?: string;
    certificateSubject?: string;
  }) => {
    const lookupPhone = payload.accountPhone || payload.phone;
    const targetStudent =
      activeStudent ||
      state.students.find((s) => s.phone === lookupPhone) ||
      state.students.find((s) => s.phone === payload.phone) ||
      state.students[0];

    const effectiveAccountPhone = targetStudent ? targetStudent.phone : lookupPhone;
    const isCertPayment =
      !!payload.isCertificate || payload.purpose.toLowerCase().includes('certificat');

    const prefix = payload.method === 'Orange Money' ? 'OM' : 'MOMO';
    const reference = `${prefix}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPayId = `pay-${Date.now()}`;

    let resolvedCertId = payload.certificateId;
    let newCertToAdd: CertificateRecord | null = null;

    if (isCertPayment) {
      if (!resolvedCertId) {
        const existingUnpaid = state.certificates.find(
          (c) =>
            c.studentPhone === effectiveAccountPhone &&
            !c.paymentConfirmed &&
            !c.paymentId
        );
        if (existingUnpaid) {
          resolvedCertId = existingUnpaid.id;
        } else {
          const subjectName =
            payload.certificateSubject ||
            payload.purpose.replace(/^Certificat\s*[·:-]?\s*/i, '').trim() ||
            'Certificat Officiel SISTO MASTER';
          const generatedCertId = `cert-${Date.now()}`;
          resolvedCertId = generatedCertId;
          newCertToAdd = {
            id: generatedCertId,
            code: `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
            studentPhone: effectiveAccountPhone,
            studentName: targetStudent ? targetStudent.nom : `Client ${payload.phone}`,
            classe: targetStudent ? targetStudent.classe : '3ème',
            subject: subjectName,
            score: '16/20',
            status: 'en_attente',
            paymentConfirmed: false,
            paymentId: newPayId,
            issuedAt: new Date().toISOString().slice(0, 10),
          };
        }
      }
    }

    const newPay: PaymentRecord = {
      id: newPayId,
      studentPhone: payload.phone,
      accountPhone: effectiveAccountPhone,
      studentName: targetStudent ? targetStudent.nom : `Client ${payload.phone}`,
      amount: payload.amount,
      method: payload.method,
      status: !isOnline ? 'en_attente' : isCertPayment ? 'à_vérifier' : 'confirmé',
      createdAt: new Date().toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      reference,
      purpose: payload.purpose,
      certificateId: resolvedCertId,
    };

    setState((prev) => {
      const updatedCerts = prev.certificates.map((c) =>
        resolvedCertId && c.id === resolvedCertId ? {...c, paymentId: newPayId} : c
      );
      return {
        ...prev,
        payments: [newPay, ...prev.payments],
        certificates: newCertToAdd ? [newCertToAdd, ...updatedCerts] : updatedCerts,
        students: prev.students.map((s) =>
          !isCertPayment && targetStudent && s.id === targetStudent.id
            ? {...s, isPremium: isOnline ? true : s.isPremium}
            : s
        ),
      };
    });

    if (!isOnline) {
      return {
        ok: true,
        queued: true,
        reference,
        message: `Paiement de ${payload.amount}F (${payload.method}) mis en file hors-ligne. Clique sur Synchroniser dès le retour du réseau.`,
      };
    }

    if (isCertPayment) {
      return {
        ok: true,
        queued: false,
        reference,
        message: `Paiement de ${payload.amount}F envoyé via ${payload.method}. Ton certificat s’affichera dès que l’administrateur confirmera que l’argent est arrivé.`,
      };
    }

    return {
      ok: true,
      queued: false,
      reference,
      message: `Paiement de ${payload.amount}F via ${payload.method} confirmé pour ${newPay.studentName} !`,
    };
  };

  const handleConfirmPaymentArrival = (paymentId: string) => {
    const targetPay = state.payments.find((p) => p.id === paymentId);
    if (!targetPay || targetPay.status === 'confirmé') return;

    const targetAccountPhone = targetPay.accountPhone || targetPay.studentPhone;
    const isCertPayment =
      !!targetPay.certificateId ||
      (targetPay.purpose || '').toLowerCase().includes('certificat');

    setState((prev) => {
      let matchedCertId = targetPay.certificateId;
      if (isCertPayment && !matchedCertId) {
        const candidate = prev.certificates.find(
          (c) =>
            c.paymentId === targetPay.id ||
            (c.studentPhone === targetAccountPhone && !c.paymentConfirmed)
        );
        matchedCertId = candidate?.id;
      }

      return {
        ...prev,
        payments: prev.payments.map((p) =>
          p.id === paymentId ? {...p, status: 'confirmé'} : p
        ),
        certificates: prev.certificates.map((c) => {
          if (
            isCertPayment &&
            (c.id === matchedCertId || c.paymentId === paymentId)
          ) {
            return {
              ...c,
              paymentConfirmed: true,
              paymentId,
              status: 'validé',
            };
          }
          return c;
        }),
        students: prev.students.map((s) =>
          !isCertPayment &&
          (s.phone === targetAccountPhone || s.phone === targetPay.studentPhone)
            ? {...s, isPremium: true}
            : s
        ),
      };
    });

    setToastMsg(
      isCertPayment
        ? `Réception de ${targetPay.amount}F confirmée (${targetPay.method}). Le certificat de ${targetPay.studentName} est maintenant affiché.`
        : `Paiement de ${targetPay.amount}F confirmé pour ${targetPay.studentName}.`
    );
  };

  const handleSyncNow = () => {
    if (!isOnline) {
      setToastMsg('Impossible de synchroniser tant que le mode hors-ligne est actif.');
      return;
    }
    setState((prev) => {
      const subscriptionPhones = new Set(
        prev.payments
          .filter(
            (p) =>
              p.status === 'en_attente' &&
              !p.certificateId &&
              !(p.purpose || '').toLowerCase().includes('certificat')
          )
          .map((p) => p.accountPhone || p.studentPhone)
      );
      return {
        ...prev,
        payments: prev.payments.map((p) => {
          if (p.status !== 'en_attente') return p;
          const isCert =
            !!p.certificateId || (p.purpose || '').toLowerCase().includes('certificat');
          return {...p, status: isCert ? 'à_vérifier' : 'confirmé'};
        }),
        students: prev.students.map((s) =>
          subscriptionPhones.has(s.phone) ? {...s, isPremium: true} : s
        ),
        pendingPointsCount: 0,
      };
    });
    setToastMsg(
      'Synchronisation terminée : points mis à jour et paiements transmis pour vérification.'
    );
  };

  const handleDownloadOffline = () => {
    setState((prev) => ({...prev, offlinePackSaved: true}));
    setToastMsg('Pack complet (SIL à Master 2 + Quiz) enregistré pour le mode hors-ligne.');
  };

  const studentCertificates = useMemo(() => {
    if (!activeStudent) return [];
    return state.certificates.filter((c) => c.studentPhone === activeStudent.phone);
  }, [activeStudent, state.certificates]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activePage={activePage}
        isStudentLoggedIn={!!activeStudent}
        isAdminLoggedIn={state.isAdminLoggedIn}
        onNavigate={(page) => {
          if ((page === 'app' || page === 'profil') && !activeStudent) {
            setActivePage('login');
            return;
          }
          if (page === 'admin' && !state.isAdminLoggedIn) {
            setActivePage('login');
            return;
          }
          setActivePage(page);
        }}
        onLogout={handleLogout}
        onInstallClick={handleInstallClick}
        showInstallButton={showInstallButton}
      />

      <WorkspaceToolbar
        lang={state.lang}
        onChangeLang={(lang) => setState((prev) => ({...prev, lang}))}
        isOnline={isOnline}
        simulatedOffline={simulatedOffline}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        offlinePackSaved={state.offlinePackSaved}
        onDownloadOffline={handleDownloadOffline}
        pendingPaymentsCount={pendingPaymentsCount}
        pendingPointsCount={state.pendingPointsCount}
        onSyncNow={handleSyncNow}
        voiceMuted={state.voiceMuted}
        onToggleMute={() =>
          setState((prev) => ({...prev, voiceMuted: !prev.voiceMuted}))
        }
        showInstallButton={showInstallButton}
        onInstallApp={handleInstallClick}
      />

      {toastMsg && (
        <div
          role="status"
          className="mx-auto mt-3 max-w-2xl px-4 w-full"
        >
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-semibold text-emerald-900">
            {toastMsg}
          </div>
        </div>
      )}

      <main className="flex-1">
        {activePage === 'login' && (
          <AuthLanding
            lang={state.lang}
            onLoginStudent={handleLoginStudent}
            onRegisterStudent={handleRegisterStudent}
            onOpenParent={handleOpenParent}
            onOpenSchool={handleOpenSchool}
            onLoginAdmin={handleLoginAdmin}
          />
        )}

        {activePage === 'app' && activeStudent && (
          <StudentWorkspace
            student={activeStudent}
            lang={state.lang}
            voiceMuted={state.voiceMuted}
            assignments={state.assignments}
            certificates={studentCertificates}
            payments={state.payments}
            onAwardPoints={handleAwardPoints}
            onToggleCourseComplete={handleToggleCourseComplete}
            onChangeVoicePersona={handleChangeVoicePersona}
            onRequestCertificate={handleRequestCertificate}
            onGoToCertPayment={(certId, subject) => {
              setPaymentIntent({type: 'certificat', certificateId: certId, subject});
              setActivePage('paiement');
            }}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'paiement' && (
          <PaymentView
            student={activeStudent}
            payments={state.payments}
            certificates={studentCertificates}
            initialIntent={paymentIntent}
            isOnline={isOnline}
            onProcessPayment={handleProcessPayment}
            onSavePreferredMethod={(preferredPaymentMethod) => {
              if (!activeStudent) return;
              setState((prev) => ({
                ...prev,
                students: prev.students.map((s) =>
                  s.id === activeStudent.id
                    ? {...s, preferredPaymentMethod}
                    : s
                ),
              }));
            }}
            onNavigate={(page) => {
              setPaymentIntent(null);
              setActivePage(page);
            }}
          />
        )}

        {activePage === 'profil' && activeStudent && (
          <ProfileView
            student={activeStudent}
            lang={state.lang}
            payments={state.payments}
            certificates={studentCertificates}
            parents={state.parents.filter((p) => p.studentId === activeStudent.id)}
            onGoToCertPayment={(certId, subject) => {
              setPaymentIntent({type: 'certificat', certificateId: certId, subject});
              setActivePage('paiement');
            }}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'parent' && (
          <ParentView
            child={parentChild}
            activeParent={activeParent}
            allParents={state.parents}
            allStudents={state.students}
            certificates={state.certificates}
            onSelectChildByPhone={(query, parentName) => {
              const clean = query.trim();
              const matchedParentByCode = state.parents.find(
                (p) => p.parentCode.toLowerCase() === clean.toLowerCase()
              );
              const found = matchedParentByCode
                ? state.students.find((s) => s.id === matchedParentByCode.studentId)
                : state.students.find(
                    (s) =>
                      s.phone === clean ||
                      s.studentCode.toLowerCase() === clean.toLowerCase()
                  );
              if (!found) return 'Aucun élève trouvé avec ce numéro ou code.';
              connectParentRecord(found, parentName || matchedParentByCode?.nom);
              return null;
            }}
            onSaveControls={(studentId, blockAfter20h, eveningSmsEnabled) => {
              setState((prev) => ({
                ...prev,
                students: prev.students.map((s) =>
                  s.id === studentId
                    ? {...s, blockAfter20h, eveningSmsEnabled}
                    : s
                ),
              }));
            }}
            canReturnToStudentApp={!!activeStudent}
            onBack={() => setActivePage('login')}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'ecole' && (
          <SchoolView
            schoolName={state.activeSchoolName}
            students={state.students}
            assignments={state.assignments}
            onPublishAssignment={(payload) => {
              const newAsg: AssignmentRecord = {
                id: `asg-${Date.now()}`,
                schoolName: payload.schoolName,
                title: payload.title,
                classe: payload.classe,
                dueDate: payload.dueDate,
                createdAt: 'À l’instant',
              };
              setState((prev) => ({
                ...prev,
                assignments: [newAsg, ...prev.assignments],
              }));
            }}
            canReturnToStudentApp={!!activeStudent}
            onBack={() => setActivePage('login')}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'admin' && state.isAdminLoggedIn && (
          <AdminView
            students={state.students}
            parents={state.parents}
            activeStudentId={state.activeStudentId}
            activeParentId={state.activeParentId}
            payments={state.payments}
            certificates={state.certificates}
            onToggleStudentPremium={(studentId) => {
              setState((prev) => ({
                ...prev,
                students: prev.students.map((s) =>
                  s.id === studentId ? {...s, isPremium: !s.isPremium} : s
                ),
              }));
            }}
            onDeleteStudent={(studentId) => {
              setState((prev) => ({
                ...prev,
                students: prev.students.filter((s) => s.id !== studentId),
                activeStudentId:
                  prev.activeStudentId === studentId ? null : prev.activeStudentId,
              }));
            }}
            onConfirmPaymentArrival={handleConfirmPaymentArrival}
            onValidateCertificate={(certId) => {
              const targetCert = state.certificates.find((c) => c.id === certId);
              if (!targetCert) return;

              const linkedPayment = state.payments.find(
                (p) =>
                  p.id === targetCert.paymentId || p.certificateId === targetCert.id
              );

              if (!targetCert.paymentConfirmed && linkedPayment?.status !== 'confirmé') {
                if (linkedPayment && linkedPayment.status === 'à_vérifier') {
                  handleConfirmPaymentArrival(linkedPayment.id);
                  return;
                }
                setToastMsg(
                  `Impossible de délivrer ${targetCert.code} : le paiement de 2000F n’a pas encore été reçu et confirmé.`
                );
                return;
              }

              setState((prev) => ({
                ...prev,
                certificates: prev.certificates.map((c) =>
                  c.id === certId
                    ? {...c, status: 'validé', paymentConfirmed: true}
                    : c
                ),
              }));
            }}
            onExitAdmin={() => {
              setState((prev) => ({...prev, isAdminLoggedIn: false}));
              setActivePage(activeStudent ? 'app' : 'login');
            }}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 mb-14 md:mb-0">
        © 2026 SISTO MASTER · Emmanuel · Ngaoundéré, Cameroun · De la SIL à l’Université
      </footer>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-3 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Installer sur iPhone / iPad
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              1. Appuie sur le bouton <strong>Partager</strong> dans la barre Safari.
              <br />
              2. Fais défiler et touche <strong>Sur l’écran d’accueil</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[42px] rounded-xl bg-blue-700 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
