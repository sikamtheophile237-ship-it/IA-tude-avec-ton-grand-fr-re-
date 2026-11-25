import React, {useState} from 'react';
import {ArrowLeft, Award, Printer} from 'lucide-react';
import {getLevelInfo} from '../data/curriculum';
import {
  ActivePage,
  CertificateRecord,
  Language,
  ParentRecord,
  PaymentRecord,
  StudentRecord,
} from '../types';
import {CertificatePrintModal} from './CertificatePrintModal';

interface ProfileViewProps {
  student: StudentRecord;
  lang: Language;
  payments: PaymentRecord[];
  certificates: CertificateRecord[];
  parents?: ParentRecord[];
  onGoToCertPayment?: (certId: string, subject: string) => void;
  onNavigate: (page: ActivePage) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  student,
  lang,
  payments,
  certificates,
  parents = [],
  onGoToCertPayment,
  onNavigate,
}) => {
  const levelInfo = getLevelInfo(student.classe);
  const totalSpent = payments
    .filter(
      (p) =>
        (p.accountPhone === student.phone || p.studentPhone === student.phone) &&
        p.status === 'confirmé'
    )
    .reduce((acc, p) => acc + p.amount, 0);

  const unlockedCertificates = certificates.filter(
    (c) => c.paymentConfirmed && c.status === 'validé'
  );
  const pendingCertificates = certificates.filter(
    (c) => !(c.paymentConfirmed && c.status === 'validé')
  );

  const [printingCert, setPrintingCert] = useState<CertificateRecord | null>(null);

  const langLabel = lang === 'fr' ? 'Français' : lang === 'ff' ? 'Fulfulde' : 'English';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-24 md:pb-10">
      <section className="rounded-2xl bg-gradient-to-br from-blue-950 to-blue-800 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-blue-200">
            {student.classe} · {levelInfo.cycle} · {student.ecole}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{student.nom}</h1>
          <p className="mt-1 font-mono text-xs text-blue-200">
            Tél : {student.phone} · Code élève : <strong className="text-white">{student.studentCode}</strong>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-blue-200">Statut du compte</p>
          <p className="mt-0.5 text-base font-bold text-white">
            {student.isPremium ? 'Membre Premium' : 'Compte Standard'}
          </p>
          {parents.length > 0 && (
            <p className="mt-1 text-xs text-blue-100">
              Parent : {parents[0].nom} · <span className="font-mono">{parents[0].parentCode}</span>
            </p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Points cumulés</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {student.points} pts
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Cours terminés</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {student.completedCourseIds.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Série active</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {student.streakDays} jours
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Total payé</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {totalSpent}F
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Voix de Sisto</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {student.voicePref === 'homme' ? 'Grand Frère' : 'Grande Sœur'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Langue active</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{langLabel}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">Mes Certificats</h2>
          </div>
          {unlockedCertificates.length > 0 && (
            <button
              type="button"
              onClick={() => setPrintingCert(unlockedCertificates[0])}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Imprimer le certificat</span>
            </button>
          )}
        </div>

        {unlockedCertificates.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun certificat délivré pour le moment. Les certificats s’affichent uniquement après le
            paiement (2000F) et la confirmation par l’administrateur que l’argent est arrivé.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {unlockedCertificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src="/src/assets/images/badge_certificate_seal_1795124968930.jpg"
                    alt="Sceau de certification"
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-lg object-cover border border-emerald-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{cert.subject}</p>
                    <p className="mt-0.5 text-xs text-slate-700">
                      Note : <strong className="font-mono">{cert.score}</strong> ·{' '}
                      <span className="font-semibold text-emerald-700">
                        Validé & Paiement confirmé
                      </span>
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      {cert.code} · Ngaoundéré · {cert.issuedAt}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrintingCert(cert)}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 shrink-0"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Imprimer</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {pendingCertificates.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-semibold text-slate-700">
              Demandes en cours (masquées jusqu’à confirmation de l’argent par l’administrateur) :
            </p>
            {pendingCertificates.map((cert) => {
              const linkedPay = payments.find(
                (p) => p.id === cert.paymentId || p.certificateId === cert.id
              );
              return (
                <div
                  key={cert.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{cert.subject}</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {!linkedPay
                        ? 'Étape 1/2 : Paiement de 2000F requis via Orange Money ou MTN MoMo.'
                        : linkedPay.status === 'en_attente'
                          ? 'Paiement hors-ligne — synchronise dès le retour du réseau.'
                          : `Étape 2/2 : Paiement envoyé (${linkedPay.method}) — en attente de confirmation par l’administrateur que l’argent est arrivé.`}
                    </p>
                  </div>
                  {!linkedPay && (
                    <button
                      type="button"
                      onClick={() =>
                        onGoToCertPayment
                          ? onGoToCertPayment(cert.id, cert.subject)
                          : onNavigate('paiement')
                      }
                      className="inline-flex min-h-[34px] items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shrink-0"
                    >
                      Payer 2000F
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => onNavigate('app')}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Retour à mon espace élève</span>
      </button>

      <CertificatePrintModal
        certificate={printingCert}
        schoolName={student.ecole}
        onClose={() => setPrintingCert(null)}
      />
    </div>
  );
};
