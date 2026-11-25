import React, {useEffect, useMemo, useState} from 'react';
import {CheckCircle2, RefreshCw, Search, ShieldCheck, Trash2} from 'lucide-react';
import {CertificateRecord, ParentRecord, PaymentRecord, StudentRecord} from '../types';

interface AdminViewProps {
  students: StudentRecord[];
  parents: ParentRecord[];
  activeStudentId: string | null;
  activeParentId: string | null;
  payments: PaymentRecord[];
  certificates: CertificateRecord[];
  onToggleStudentPremium: (studentId: string) => void;
  onDeleteStudent: (studentId: string) => void;
  onConfirmPaymentArrival: (paymentId: string) => void;
  onValidateCertificate: (certId: string) => void;
  onExitAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  students,
  parents,
  activeStudentId,
  activeParentId,
  payments,
  certificates,
  onToggleStudentPremium,
  onDeleteStudent,
  onConfirmPaymentArrival,
  onValidateCertificate,
  onExitAdmin,
}) => {
  const [liveTime, setLiveTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState('À l’instant');

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const confirmedRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'confirmé')
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const pendingPaymentsToVerify = useMemo(
    () => payments.filter((p) => p.status === 'à_vérifier').length,
    [payments]
  );

  const premiumCount = students.filter((s) => s.isPremium).length;
  const pendingCertsCount = certificates.filter(
    (c) => !(c.paymentConfirmed && c.status === 'validé')
  ).length;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nom.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.classe.toLowerCase().includes(q) ||
        s.ecole.toLowerCase().includes(q)
    );
  }, [searchQuery, students]);

  const filteredParents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return parents;
    return parents.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.parentCode.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        p.studentCode.toLowerCase().includes(q) ||
        p.studentPhone.toLowerCase().includes(q)
    );
  }, [parents, searchQuery]);

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString('fr-FR'));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-24 md:pb-10">
      <section className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-orange-400" aria-hidden="true" />
            <span>Ngaoundéré · Super Administration · Heure :</span>
            <span className="font-mono tabular-nums text-white">{liveTime}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Dashboard Super Admin V3</h1>
          <p className="mt-1 text-xs text-slate-300">
            Voix active · Hors-ligne prêt · Langues : FR 80% / FF 15% / EN 5% · Actualisé :{' '}
            <span className="font-mono">{lastRefreshed}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Actualiser</span>
          </button>
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex min-h-[42px] items-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Quitter Admin
          </button>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Revenu total confirmé</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {confirmedRevenue}F
          </p>
          <p className="mt-1 text-xs font-mono tabular-nums text-slate-500">
            {payments.length} transaction(s)
            {pendingPaymentsToVerify > 0 && (
              <span className="text-amber-700 font-semibold">
                {' '}
                · {pendingPaymentsToVerify} à confirmer
              </span>
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Élèves inscrits</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {students.length}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-mono tabular-nums">
            {premiumCount} Premium
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Certificats</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {certificates.length}
          </p>
          <p className="mt-1 text-xs text-amber-700 font-mono tabular-nums">
            {pendingCertsCount} en attente
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Écoles partenaires</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">3</p>
          <p className="mt-1 text-xs text-slate-500">Ngaoundéré & Adamaoua</p>
        </div>
      </section>

      {/* Student Search & Management */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Élèves inscrits & Codes attribués
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chaque élève reçoit automatiquement un code unique à l’inscription ou à la connexion.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher nom, code (ELV/PAR), téléphone..."
              className="w-full min-h-[40px] rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Nom de l’élève</th>
                <th className="py-2.5 pr-4">Code attribué</th>
                <th className="py-2.5 pr-4">Téléphone</th>
                <th className="py-2.5 pr-4">Classe</th>
                <th className="py-2.5 pr-4">Points</th>
                <th className="py-2.5 pr-4">Statut</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-slate-500">
                    Aucun élève ne correspond à cette recherche.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id} className="text-slate-800">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{stu.nom}</p>
                      {stu.id === activeStudentId && (
                        <p className="text-[11px] font-semibold text-emerald-700">
                          Connecté actuellement
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs font-bold text-blue-800">
                      {stu.studentCode}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-600">{stu.phone}</td>
                    <td className="py-3 pr-4 text-slate-600">{stu.classe}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums">{stu.points} pts</td>
                    <td className="py-3 pr-4 text-xs font-semibold">
                      {stu.isPremium ? (
                        <span className="text-emerald-700">Premium</span>
                      ) : (
                        <span className="text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStudentPremium(stu.id)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {stu.isPremium ? 'Passer Standard' : 'Activer Premium'}
                      </button>
                      {stu.phone !== '690123456' && (
                        <button
                          type="button"
                          onClick={() => onDeleteStudent(stu.id)}
                          aria-label={`Supprimer ${stu.nom}`}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Connected Parents & Auto-Assigned Codes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Parents connectés & Codes attribués automatiquement
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chaque parent connecté reçoit automatiquement un code personnel ({parents.length}{' '}
              enregistré(s)).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Nom du parent</th>
                <th className="py-2.5 pr-4">Code parent attribué</th>
                <th className="py-2.5 pr-4">Élève suivi</th>
                <th className="py-2.5 pr-4">Code élève</th>
                <th className="py-2.5 text-right">Dernière connexion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                    Aucun parent ne correspond à cette recherche.
                  </td>
                </tr>
              ) : (
                filteredParents.map((par) => (
                  <tr key={par.id} className="text-slate-800">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{par.nom}</p>
                      {par.id === activeParentId && (
                        <p className="text-[11px] font-semibold text-violet-700">
                          Parent connecté
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs font-bold text-violet-800">
                      {par.parentCode}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-slate-900">{par.studentName}</span> ·{' '}
                      <span className="font-mono text-xs text-slate-500">{par.studentPhone}</span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-blue-800">
                      {par.studentCode}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-slate-500 tabular-nums">
                      {par.connectedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Certificate Queue */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Validation des certificats</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Un certificat s’affiche pour l’élève uniquement après paiement et confirmation de réception de l’argent.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {certificates.map((cert) => {
              const linkedPay = payments.find(
                (p) => p.id === cert.paymentId || p.certificateId === cert.id
              );
              const isUnlocked = cert.paymentConfirmed && cert.status === 'validé';
              const hasVerifiablePayment = linkedPay?.status === 'à_vérifier';
              const hasConfirmedPayment =
                cert.paymentConfirmed || linkedPay?.status === 'confirmé';

              return (
                <div
                  key={cert.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {cert.studentName} · {cert.subject}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {cert.code} · {cert.classe} · {cert.score}
                    </p>
                    <p className="text-[11px] mt-0.5">
                      {hasConfirmedPayment ? (
                        <span className="font-semibold text-emerald-700">
                          Argent reçu ({linkedPay?.method || 'Mobile Money'})
                        </span>
                      ) : hasVerifiablePayment ? (
                        <span className="font-semibold text-amber-700">
                          Paiement envoyé ({linkedPay.method} · {linkedPay.reference}) — à confirmer
                        </span>
                      ) : linkedPay?.status === 'en_attente' ? (
                        <span className="text-slate-500">Paiement hors-ligne non synchronisé</span>
                      ) : (
                        <span className="text-red-700 font-medium">Paiement 2000F non reçu</span>
                      )}
                    </p>
                  </div>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Affiché
                    </span>
                  ) : hasConfirmedPayment || hasVerifiablePayment ? (
                    <button
                      type="button"
                      onClick={() => onValidateCertificate(cert.id)}
                      className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 shrink-0"
                    >
                      {hasVerifiablePayment ? 'Confirmer argent & afficher' : 'Débloquer'}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 shrink-0">
                      Non payé
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Payments Ledger */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Journal Mobile Money</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vérifie ton solde Orange Money / MTN MoMo puis confirme l’arrivée de l’argent.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2 pr-3">Élève</th>
                  <th className="py-2 pr-3">Opérateur / Réf</th>
                  <th className="py-2 pr-3">Montant</th>
                  <th className="py-2 text-right">Action / État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-slate-900">{pay.studentName}</p>
                      <p className="text-[11px] text-slate-500">{pay.purpose || 'Abonnement'}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-xs">
                      <p
                        className={`font-semibold ${
                          pay.method === 'Orange Money' ? 'text-orange-700' : 'text-amber-800'
                        }`}
                      >
                        {pay.method}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {pay.reference || pay.id}
                      </p>
                    </td>
                    <td className="py-2.5 pr-3 font-mono font-semibold tabular-nums">
                      {pay.amount}F
                    </td>
                    <td className="py-2.5 text-right text-xs font-semibold whitespace-nowrap">
                      {pay.status === 'confirmé' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Argent confirmé
                        </span>
                      ) : pay.status === 'à_vérifier' ? (
                        <button
                          type="button"
                          onClick={() => onConfirmPaymentArrival(pay.id)}
                          className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                        >
                          Confirmer argent reçu
                        </button>
                      ) : (
                        <span className="text-slate-500">Hors-ligne</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
