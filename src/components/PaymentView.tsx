import React, {useMemo, useState} from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Receipt,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {getLevelInfo} from '../data/curriculum';
import {ActivePage, CertificateRecord, PaymentRecord, StudentRecord} from '../types';

interface PaymentViewProps {
  student: StudentRecord | null;
  payments: PaymentRecord[];
  certificates?: CertificateRecord[];
  initialIntent?: {
    type: 'abonnement' | 'certificat';
    certificateId?: string;
    subject?: string;
  } | null;
  isOnline: boolean;
  onProcessPayment: (payload: {
    amount: number;
    method: 'MTN MoMo' | 'Orange Money';
    phone: string;
    pin: string;
    purpose: string;
    accountPhone?: string;
    isCertificate?: boolean;
    certificateId?: string;
    certificateSubject?: string;
  }) => {ok: boolean; queued: boolean; reference?: string; message: string};
  onSavePreferredMethod?: (method: 'MTN MoMo' | 'Orange Money') => void;
  onNavigate: (page: ActivePage) => void;
}

const OFFERS = [
  {amount: 500, label: 'Primaire (SIL – CM2)', detail: 'Lecture, Calcul & prépa CEP'},
  {amount: 1000, label: 'Collège (6ème – 3ème)', detail: 'Cours complets & annales BEPC'},
  {amount: 1500, label: 'Lycée (2nde – Terminale)', detail: 'Probatoire & BAC A, C, D'},
  {amount: 2000, label: 'Université (L1 – M2)', detail: 'Mémoires, Algo, CV & soutenance'},
];

function detectCameroonOperator(rawPhone: string): 'MTN MoMo' | 'Orange Money' | null {
  const digits = rawPhone.replace(/\D/g, '');
  const local = digits.startsWith('237') ? digits.slice(3) : digits;
  if (local.length < 2) return null;
  const p2 = local.slice(0, 2);
  const p3 = local.slice(0, 3);
  if (p2 === '69' || ['655', '656', '657', '658', '659', '685', '686', '687', '688', '689'].includes(p3)) {
    return 'Orange Money';
  }
  if (p2 === '67' || ['650', '651', '652', '653', '654', '680', '681', '682', '683', '684'].includes(p3)) {
    return 'MTN MoMo';
  }
  return null;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  student,
  payments,
  certificates = [],
  initialIntent,
  isOnline,
  onProcessPayment,
  onSavePreferredMethod,
  onNavigate,
}) => {
  const defaultPrice = student ? getLevelInfo(student.classe).price : 1000;
  const unpaidCerts = useMemo(
    () => certificates.filter((c) => !c.paymentConfirmed && !c.paymentId),
    [certificates]
  );

  const [paymentType, setPaymentType] = useState<'abonnement' | 'certificat'>(
    initialIntent?.type || 'abonnement'
  );
  const [selectedCertId, setSelectedCertId] = useState<string>(
    initialIntent?.certificateId || unpaidCerts[0]?.id || 'new'
  );
  const [newCertSubject, setNewCertSubject] = useState<string>(
    initialIntent?.subject ||
      `${student ? getLevelInfo(student.classe).exam : 'BEPC'} · Synthèse Générale`
  );
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultPrice);
  const [method, setMethod] = useState<'MTN MoMo' | 'Orange Money'>(
    student?.preferredPaymentMethod ||
      (student?.phone ? detectCameroonOperator(student.phone) || 'Orange Money' : 'Orange Money')
  );
  const [manualMethodSelected, setManualMethodSelected] = useState<boolean>(false);
  const [saveAsPreferred, setSaveAsPreferred] = useState<boolean>(true);
  const [phone, setPhone] = useState(student?.phone || '690123456');
  const [accountPhone, setAccountPhone] = useState(student?.phone || '690123456');
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<{
    ok: boolean;
    reference?: string;
    message: string;
  } | null>(null);

  const selectedUnpaidCert = useMemo(
    () => unpaidCerts.find((c) => c.id === selectedCertId) || null,
    [selectedCertId, unpaidCerts]
  );

  const effectiveAmount = paymentType === 'certificat' ? 2000 : selectedAmount;
  const selectedOffer = OFFERS.find((o) => o.amount === selectedAmount) || OFFERS[1];
  const certSubjectDisplay = selectedUnpaidCert
    ? selectedUnpaidCert.subject
    : newCertSubject;
  const purposeLabel =
    paymentType === 'certificat'
      ? `Certificat · ${certSubjectDisplay}`
      : `Abonnement ${selectedOffer.label}`;

  const detectedOperator = useMemo(() => detectCameroonOperator(phone), [phone]);

  const handleSelectMethod = (nextMethod: 'MTN MoMo' | 'Orange Money') => {
    setMethod(nextMethod);
    setManualMethodSelected(true);
    if (student && saveAsPreferred && onSavePreferredMethod) {
      onSavePreferredMethod(nextMethod);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!manualMethodSelected) {
      const detected = detectCameroonOperator(val);
      if (detected) {
        setMethod(detected);
      }
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('237') ? digits.slice(3) : digits;
    if (!/^6\d{8}$/.test(normalized)) {
      setResult({
        ok: false,
        message: 'Entre un numéro camerounais valide à 9 chiffres commençant par 6 (ex : 690123456 ou 677234561).',
      });
      return;
    }
    if (pin.trim().length < 4) {
      setResult({
        ok: false,
        message: `Entre ton code PIN ${method === 'MTN MoMo' ? 'MTN Mobile Money' : 'Orange Money'} (4 chiffres, ex : 1234).`,
      });
      return;
    }
    if (student && saveAsPreferred && onSavePreferredMethod) {
      onSavePreferredMethod(method);
    }

    const res = onProcessPayment({
      amount: effectiveAmount,
      method,
      phone: phone.trim(),
      pin: pin.trim(),
      purpose: purposeLabel,
      accountPhone: accountPhone.trim(),
      isCertificate: paymentType === 'certificat',
      certificateId:
        paymentType === 'certificat' && selectedUnpaidCert
          ? selectedUnpaidCert.id
          : undefined,
      certificateSubject:
        paymentType === 'certificat' ? certSubjectDisplay : undefined,
    });
    setResult({ok: res.ok, reference: res.reference, message: res.message});
    setPin('');
  };

  const recentPayments = useMemo(() => payments.slice(0, 6), [payments]);

  return (
    <div id="page-paiement" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-24 md:pb-10">
      <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-blue-800 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-blue-200">
            Orange Money (#150#) · MTN Mobile Money (*126#) · 0F frais opérateur
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
            Paiement Mobile Money
          </h1>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-blue-200">Montant à régler</p>
          <p className="font-mono text-2xl font-bold tabular-nums">{effectiveAmount}F CFA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Step 1: Purpose & Cycle Selection */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">1. Choix de l’offre</h2>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPaymentType('abonnement')}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  paymentType === 'abonnement'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Abonnement
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('certificat')}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  paymentType === 'certificat'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Certificat
              </button>
            </div>
          </div>

          {paymentType === 'abonnement' ? (
            <div className="space-y-2.5">
              {OFFERS.map((offer) => {
                const active = selectedAmount === offer.amount;
                return (
                  <button
                    key={offer.amount}
                    type="button"
                    onClick={() => setSelectedAmount(offer.amount)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                      active
                        ? 'border-blue-700 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-900">{offer.label}</span>
                      <span className="font-mono text-sm font-bold text-blue-800 tabular-nums">
                        {offer.amount}F
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{offer.detail}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  Certificat Officiel Vérifié
                </span>
                <span className="font-mono text-sm font-bold text-emerald-800 tabular-nums">
                  2000F
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Le certificat (avec sceau officiel et code vérifiable) s’affiche automatiquement
                après ton paiement et la confirmation par l’administrateur que l’argent est arrivé.
              </p>

              {unpaidCerts.length > 0 && (
                <div>
                  <label
                    htmlFor="pendingCertSelect"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Demande à régler
                  </label>
                  <select
                    id="pendingCertSelect"
                    value={selectedCertId}
                    onChange={(e) => setSelectedCertId(e.target.value)}
                    className="mt-1 w-full min-h-[40px] rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    {unpaidCerts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject} ({c.code})
                      </option>
                    ))}
                    <option value="new">+ Nouvelle demande de certificat</option>
                  </select>
                </div>
              )}

              {(unpaidCerts.length === 0 || selectedCertId === 'new') && (
                <div>
                  <label
                    htmlFor="newCertSubject"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Matière / Mention du certificat
                  </label>
                  <select
                    id="newCertSubject"
                    value={newCertSubject}
                    onChange={(e) => setNewCertSubject(e.target.value)}
                    className="mt-1 w-full min-h-[40px] rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    <option
                      value={`${
                        student ? getLevelInfo(student.classe).exam : 'BEPC'
                      } · Synthèse Générale`}
                    >
                      {student ? getLevelInfo(student.classe).exam : 'BEPC'} · Synthèse Générale
                    </option>
                    <option value="Espagnol LV2 · Maîtrise">Espagnol LV2 · Maîtrise</option>
                    <option value="Mathématiques · Excellence">Mathématiques · Excellence</option>
                    <option value="Anglais Académique">Anglais Académique</option>
                    <option value="Insertion Pro & CV">Insertion Pro & CV</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {!student && (
            <div className="pt-2 border-t border-slate-100">
              <label
                htmlFor="targetStudentPhone"
                className="block text-xs font-semibold text-slate-700"
              >
                Numéro du compte élève à créditer
              </label>
              <input
                id="targetStudentPhone"
                type="tel"
                value={accountPhone}
                onChange={(e) => setAccountPhone(e.target.value)}
                placeholder="Ex : 690123456"
                className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          )}
        </section>

        {/* Step 2: Orange Money & MTN MoMo Checkout */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              2. Choisis ta méthode de paiement préférée
            </h2>
            <span className="text-xs font-medium text-slate-500">Paiement sécurisé CM</span>
          </div>

          <form onSubmit={handlePaySubmit} className="space-y-5">
            <fieldset
              role="radiogroup"
              aria-label="Méthode de paiement Mobile Money"
              className="space-y-3"
            >
              <legend className="text-xs font-semibold text-slate-700">
                Étape 1 : Sélectionne ton opérateur (MTN Mobile Money ou Orange Money) :
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label
                  htmlFor="radio-mtn-momo"
                  className={`relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                    method === 'MTN MoMo'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    id="radio-mtn-momo"
                    type="radio"
                    name="paymentMethod"
                    value="MTN Mobile Money"
                    checked={method === 'MTN MoMo'}
                    onChange={() => handleSelectMethod('MTN MoMo')}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-amber-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-amber-900">
                        MTN Mobile Money
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-800">*126#</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Préfixes 67x · 650–654 · 680–684
                    </p>
                    <p
                      className={`mt-1.5 text-[11px] font-semibold ${
                        method === 'MTN MoMo' ? 'text-amber-800' : 'text-slate-400'
                      }`}
                    >
                      {method === 'MTN MoMo' ? 'Méthode sélectionnée' : 'Cliquer pour choisir'}
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="radio-orange-money"
                  className={`relative flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                    method === 'Orange Money'
                      ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    id="radio-orange-money"
                    type="radio"
                    name="paymentMethod"
                    value="Orange Money"
                    checked={method === 'Orange Money'}
                    onChange={() => handleSelectMethod('Orange Money')}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-orange-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-orange-800">
                        Orange Money
                      </span>
                      <span className="font-mono text-xs font-bold text-orange-700">#150#</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Préfixes 69x · 655–659 · 685–689
                    </p>
                    <p
                      className={`mt-1.5 text-[11px] font-semibold ${
                        method === 'Orange Money' ? 'text-orange-700' : 'text-slate-400'
                      }`}
                    >
                      {method === 'Orange Money'
                        ? 'Méthode sélectionnée'
                        : 'Cliquer pour choisir'}
                    </p>
                  </div>
                </label>
              </div>

              {student && (
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsPreferred}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSaveAsPreferred(checked);
                      if (checked && onSavePreferredMethod) {
                        onSavePreferredMethod(method);
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-700"
                  />
                  <span>
                    Mémoriser {method === 'MTN MoMo' ? 'MTN Mobile Money' : 'Orange Money'} comme
                    méthode préférée
                  </span>
                </label>
              )}
            </fieldset>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-700">
                Étape 2 : Saisis ton numéro et ton code PIN{' '}
                <span
                  className={
                    method === 'MTN MoMo' ? 'text-amber-800 font-bold' : 'text-orange-700 font-bold'
                  }
                >
                  {method === 'MTN MoMo' ? 'MTN Mobile Money' : 'Orange Money'}
                </span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="payPhone" className="block text-xs font-semibold text-slate-700">
                      Numéro {method === 'MTN MoMo' ? 'MTN Mobile Money' : 'Orange Money'}
                    </label>
                    {detectedOperator && (
                      <span className="text-[11px] font-medium text-slate-500">
                        {detectedOperator}
                      </span>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <Smartphone
                      className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="payPhone"
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Ex : 690123456 ou 677234561"
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="payPin" className="block text-xs font-semibold text-slate-700">
                    Code PIN {method === 'MTN MoMo' ? 'MTN Mobile Money' : 'Orange Money'} (ex :
                    1234)
                  </label>
                  <div className="relative mt-1.5">
                    <ShieldCheck
                      className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="payPin"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Motif</span>
                <strong className="text-slate-900">{purposeLabel}</strong>
              </div>
              <div className="flex justify-between">
                <span>Méthode choisie</span>
                <strong className="text-slate-900">
                  {method === 'MTN MoMo' ? 'MTN Mobile Money (*126#)' : 'Orange Money (#150#)'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Frais de service</span>
                <strong className="font-mono text-emerald-700">0F CFA</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-semibold text-slate-900">Total débité</span>
                <strong className="font-mono text-sm text-slate-900 tabular-nums">
                  {effectiveAmount}F CFA
                </strong>
              </div>
            </div>

            {!isOnline && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Mode Hors-ligne actif : le paiement sera enregistré en file locale et validé dès
                que internet revient.
              </p>
            )}

            {result && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium ${
                  result.ok
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {result.ok && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
                <div>
                  <p>{result.message}</p>
                  {result.reference && (
                    <p className="mt-1 font-mono text-[11px] text-emerald-800">
                      Référence : {result.reference}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors ${
                method === 'Orange Money'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <span>
                Payer {effectiveAmount}F avec{' '}
                {method === 'MTN MoMo' ? 'MTN Mobile Money' : 'Orange Money'}
              </span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => onNavigate(student ? 'app' : 'login')}
            className="inline-flex w-full min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{student ? 'Retour à mes cours' : 'Retour à l’accueil'}</span>
          </button>
        </section>
      </div>

      {/* Recent Mobile Money Receipts */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-800" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-900">
            Reçus Orange Money & MTN MoMo récents
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Référence</th>
                <th className="py-2.5 pr-4">Élève / Numéro</th>
                <th className="py-2.5 pr-4">Opérateur</th>
                <th className="py-2.5 pr-4">Motif</th>
                <th className="py-2.5 pr-4">Montant</th>
                <th className="py-2.5 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((pay) => (
                <tr key={pay.id} className="text-slate-800">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">
                    {pay.reference || pay.id}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold">{pay.studentName}</span> ·{' '}
                    <span className="font-mono text-xs text-slate-500">{pay.studentPhone}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold">
                    <span
                      className={
                        pay.method === 'Orange Money' ? 'text-orange-700' : 'text-amber-800'
                      }
                    >
                      {pay.method}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">
                    {pay.purpose || 'Abonnement Premium'}
                  </td>
                  <td className="py-3 pr-4 font-mono font-semibold tabular-nums">
                    {pay.amount}F
                  </td>
                  <td className="py-3 text-right text-xs font-semibold">
                    <span
                      className={
                        pay.status === 'confirmé'
                          ? 'text-emerald-700'
                          : pay.status === 'à_vérifier'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                      }
                    >
                      {pay.status === 'confirmé'
                        ? 'Confirmé'
                        : pay.status === 'à_vérifier'
                          ? 'En attente admin'
                          : 'Hors-ligne'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
