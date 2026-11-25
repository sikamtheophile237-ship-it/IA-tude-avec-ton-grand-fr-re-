import React, {useState} from 'react';
import {ArrowLeft, CheckCircle2, Lock, MessageSquareText} from 'lucide-react';
import {ActivePage, CertificateRecord, ParentRecord, StudentRecord} from '../types';

interface ParentViewProps {
  child: StudentRecord;
  activeParent: ParentRecord | null;
  allParents: ParentRecord[];
  allStudents: StudentRecord[];
  certificates: CertificateRecord[];
  onSelectChildByPhone: (phoneOrCode: string, parentName?: string) => string | null;
  onSaveControls: (studentId: string, blockAfter20h: boolean, eveningSmsEnabled: boolean) => void;
  onBack: () => void;
  canReturnToStudentApp: boolean;
  onNavigate: (page: ActivePage) => void;
}

export const ParentView: React.FC<ParentViewProps> = ({
  child,
  activeParent,
  allParents,
  allStudents,
  certificates,
  onSelectChildByPhone,
  onSaveControls,
  onBack,
  canReturnToStudentApp,
  onNavigate,
}) => {
  const [searchPhone, setSearchPhone] = useState(child.phone);
  const [parentNameInput, setParentNameInput] = useState(activeParent?.nom || '');
  const [lookupError, setLookupError] = useState('');
  const [block20h, setBlock20h] = useState(child.blockAfter20h);
  const [smsEvening, setSmsEvening] = useState(child.eveningSmsEnabled);
  const [savedMsg, setSavedMsg] = useState('');

  const childCerts = certificates.filter((c) => c.studentPhone === child.phone);
  const progressPct = Math.min(100, Math.max(25, child.completedCourseIds.length * 25 + 30));

  const displayedParent =
    activeParent || allParents.find((p) => p.studentId === child.id) || null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onSelectChildByPhone(searchPhone.trim(), parentNameInput.trim());
    setLookupError(err || '');
    if (!err) {
      const target = allStudents.find(
        (s) =>
          s.phone === searchPhone.trim() ||
          s.studentCode.toLowerCase() === searchPhone.trim().toLowerCase()
      );
      if (target) {
        setBlock20h(target.blockAfter20h);
        setSmsEvening(target.eveningSmsEnabled);
      }
      setSavedMsg('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveControls(child.id, block20h, smsEvening);
    setSavedMsg('Paramètres parentaux enregistrés.');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-24 md:pb-10">
      <section className="rounded-2xl bg-gradient-to-br from-violet-900 to-violet-700 p-6 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs text-violet-200">Suivi scolaire familial · Français & Fulfulde</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Espace Parents</h1>
          {displayedParent && (
            <p className="mt-1.5 text-xs text-violet-100">
              Parent connecté : <strong className="text-white">{displayedParent.nom}</strong> · Code
              attribué :{' '}
              <span className="font-mono font-bold text-white tabular-nums">
                {displayedParent.parentCode}
              </span>
            </p>
          )}
        </div>
        <form onSubmit={handleLookup} className="flex flex-wrap gap-2">
          <input
            type="text"
            aria-label="Votre nom (Parent)"
            value={parentNameInput}
            onChange={(e) => setParentNameInput(e.target.value)}
            placeholder="Nom du parent"
            className="min-h-[40px] w-40 rounded-xl border border-violet-500 bg-violet-950/60 px-3 py-1.5 text-sm text-white placeholder:text-violet-300 focus:outline-none"
          />
          <input
            type="text"
            aria-label="Numéro ou code de l'enfant"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Tél ou Code élève"
            className="min-h-[40px] w-40 rounded-xl border border-violet-500 bg-violet-950/60 px-3 py-1.5 text-sm text-white placeholder:text-violet-300 focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[40px] rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-violet-900 hover:bg-violet-50 transition-colors"
          >
            Afficher
          </button>
        </form>
      </section>

      {lookupError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {lookupError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Child Progress */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <p className="text-xs text-slate-500">
              {child.classe} · {child.ecole} · Tél {child.phone} · Code élève{' '}
              <span className="font-mono font-semibold text-slate-800">{child.studentCode}</span>
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{child.nom}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-slate-100 py-4">
            <div>
              <p className="text-xs text-slate-500">Aujourd’hui</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-slate-900 tabular-nums">
                {child.studyMinutesToday} min
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Points cumulés</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-slate-900 tabular-nums">
                {child.points} pts
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Dernier quiz</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-700">{child.lastQuizScore}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Abonnement</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {child.isPremium ? 'À jour (Premium)' : 'Gratuit'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Certificats</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                {
                  childCerts.filter(
                    (c) => c.paymentConfirmed && c.status === 'validé'
                  ).length
                }{' '}
                délivré(s)
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Série</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                {child.streakDays} jours
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Progression hebdomadaire</span>
              <span className="font-mono tabular-nums">{progressPct}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-violet-700" style={{width: `${progressPct}%`}} />
            </div>
          </div>

          {/* Evening SMS Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MessageSquareText className="h-4 w-4 text-violet-700" aria-hidden="true" />
              <span>Aperçu du SMS automatique du soir</span>
            </div>
            <p className="text-sm text-slate-800">
              « Bonsoir, votre enfant {child.nom} a révisé {child.studyMinutesToday} min aujourd’hui
              et a obtenu {child.lastQuizScore}. Bravo ! — SISTO MASTER »
            </p>
            <p className="text-xs text-slate-600 border-t border-slate-200 pt-2">
              <strong>En Fulfulde :</strong> « Jam tan, ɓiɗɗo maa {child.nom} janngii hojomaaji{' '}
              {child.studyMinutesToday}, o heɓii {child.lastQuizScore}. Barke ! »
            </p>
          </div>
        </section>

        {/* Parental Controls */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-violet-700" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-900">Contrôle parental</h2>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={block20h}
                onChange={(e) => setBlock20h(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-700"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Bloquer l’application après 20h00
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Protège le sommeil de l’élève pendant la période scolaire.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={smsEvening}
                onChange={(e) => setSmsEvening(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-700"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Recevoir le bilan SMS chaque soir
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Résumé quotidien envoyé en Français et en Fulfulde.
                </p>
              </div>
            </label>

            {savedMsg && (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{savedMsg}</span>
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 transition-colors"
            >
              Enregistrer les réglages
            </button>
            <button
              type="button"
              onClick={() => (canReturnToStudentApp ? onNavigate('app') : onBack())}
              className="inline-flex w-full min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{canReturnToStudentApp ? 'Retour à l’App Élève' : 'Retour à l’accueil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
