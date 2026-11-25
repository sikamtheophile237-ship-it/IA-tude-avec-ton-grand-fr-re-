import React, {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Award, Printer, ShieldCheck, X} from 'lucide-react';
import {CertificateRecord} from '../types';

interface CertificatePrintModalProps {
  certificate: CertificateRecord | null;
  schoolName?: string;
  onClose: () => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  certificate,
  schoolName,
  onClose,
}) => {
  useEffect(() => {
    if (!certificate) return;
    document.body.classList.add('has-cert-print-modal');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('has-cert-print-modal');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [certificate, onClose]);

  if (!certificate || !certificate.paymentConfirmed || certificate.status !== 'validé') {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      id="certificate-print-portal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-print-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-4xl space-y-4 my-auto">
        {/* Toolbar (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Aperçu officiel avant impression
            </p>
            <p className="text-xs text-slate-500">
              Format A4 Paysage · Utilise « Enregistrer au format PDF » ou ton imprimante
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer l’aperçu d’impression"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Sheet */}
        <article
          id="printable-certificate-sheet"
          className="relative overflow-hidden rounded-2xl border-2 border-blue-900 bg-white p-6 sm:p-10 text-slate-900 shadow-lg"
        >
          {/* Inner diplomatic frame */}
          <div className="rounded-xl border border-amber-500/70 p-5 sm:p-8 space-y-6">
            {/* Top Institutional Header */}
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-slate-600">
                  République du Cameroun · Paix – Travail – Patrie
                </p>
                <p className="text-lg font-extrabold tracking-tight text-blue-950">
                  SISTO MASTER
                </p>
                <p className="text-xs text-slate-500">
                  Plateforme Éducative Nationale · De la SIL à l’Université · Ngaoundéré
                </p>
              </div>

              <div className="flex items-center gap-3 sm:text-right">
                <div>
                  <p className="text-xs text-slate-500">Code de vérification</p>
                  <p className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {certificate.code}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Paiement vérifié et validé
                  </p>
                </div>
              </div>
            </header>

            {/* Main Certificate Title & Recipient */}
            <div className="text-center space-y-4 py-2">
              <p className="text-xs font-semibold tracking-wide text-amber-700">
                Attestation Officielle de Réussite
              </p>
              <h1
                id="cert-print-title"
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-950"
              >
                Certificat de Maîtrise Académique
              </h1>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                La Direction Pédagogique de <strong>SISTO MASTER</strong> certifie que l’élève
                ci-dessous a suivi le programme et validé l’évaluation officielle avec succès :
              </p>

              <div className="py-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {certificate.studentName}
                </p>
                <p className="mt-1.5 text-sm text-slate-600">
                  Classe : <strong className="text-slate-900">{certificate.classe}</strong>
                  {schoolName ? (
                    <>
                      {' '}
                      · Établissement : <strong className="text-slate-900">{schoolName}</strong>
                    </>
                  ) : null}{' '}
                  · Tél : <span className="font-mono">{certificate.studentPhone}</span>
                </p>
              </div>

              {/* Discipline & Score Block */}
              <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500">Matière / Mention</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {certificate.subject}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Note obtenue</p>
                  <p className="mt-0.5 font-mono text-lg font-extrabold text-emerald-700 tabular-nums">
                    {certificate.score}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date de délivrance</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {certificate.issuedAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Seal & Signatures Footer */}
            <footer className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-t border-slate-200 pt-5">
              <div className="flex items-center gap-3.5">
                <div className="relative h-16 w-16 rounded-xl border border-amber-300 bg-amber-50 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/src/assets/images/badge_certificate_seal_1795124968930.jpg"
                    alt="Sceau officiel SISTO MASTER"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <Award
                    className="sr-only h-8 w-8 text-amber-700"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    <span>Sceau Authentifié SISTO MASTER</span>
                  </p>
                  <p>Ngaoundéré · Région de l’Adamaoua · Cameroun</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    Réf : {certificate.code}
                  </p>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <p className="text-xs text-slate-500">Fait à Ngaoundéré, le {certificate.issuedAt}</p>
                <p className="text-sm font-bold text-blue-950 pt-2">
                  Emmanuel · Direction SISTO MASTER
                </p>
                <p className="text-[11px] text-slate-500">
                  Validation administrative et financière confirmée
                </p>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>,
    document.body
  );
};
