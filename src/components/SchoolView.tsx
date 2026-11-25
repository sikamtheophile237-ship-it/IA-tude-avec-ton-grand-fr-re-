import React, {useState} from 'react';
import {ArrowLeft, CheckCircle2, Send} from 'lucide-react';
import {ActivePage, AssignmentRecord, StudentRecord} from '../types';

interface SchoolViewProps {
  schoolName: string;
  students: StudentRecord[];
  assignments: AssignmentRecord[];
  onPublishAssignment: (payload: {
    schoolName: string;
    title: string;
    classe: string;
    dueDate: string;
  }) => void;
  canReturnToStudentApp: boolean;
  onBack: () => void;
  onNavigate: (page: ActivePage) => void;
}

export const SchoolView: React.FC<SchoolViewProps> = ({
  schoolName,
  students,
  assignments,
  onPublishAssignment,
  canReturnToStudentApp,
  onBack,
  onNavigate,
}) => {
  const [devoirTitre, setDevoirTitre] = useState('');
  const [devoirClasse, setDevoirClasse] = useState('3ème');
  const [devoirEcheance, setDevoirEcheance] = useState('Demain · 08:00');
  const [devoirFeedback, setDevoirFeedback] = useState('');

  const topStudent = [...students].sort((a, b) => b.points - a.points)[0];

  const handleSendHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoirTitre.trim()) {
      setDevoirFeedback('Entre un intitulé de devoir avant d’envoyer.');
      return;
    }
    onPublishAssignment({
      schoolName,
      title: devoirTitre.trim(),
      classe: devoirClasse,
      dueDate: devoirEcheance.trim() || 'Prochain cours',
    });
    setDevoirFeedback(`Devoir diffusé aux élèves de ${devoirClasse} (${schoolName}).`);
    setDevoirTitre('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-24 md:pb-10">
      <section className="rounded-2xl bg-gradient-to-br from-teal-900 to-teal-700 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-teal-200">Portail Établissement & Université</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{schoolName}</h1>
        </div>
        <p className="font-mono text-sm font-semibold text-teal-100">
          Abonnement Partenaire · 200.000F / mois
        </p>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Élèves actifs</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {students.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Moyenne générale</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            14,5 / 20
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Devoirs publiés</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {assignments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Meilleur élève</p>
          <p className="mt-1 text-base font-bold text-slate-900 truncate">
            {topStudent ? `${topStudent.nom} (${topStudent.points} pts)` : '—'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Broadcast Assignment */}
        <form
          onSubmit={handleSendHomework}
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900">
            Envoyer un devoir à toute la classe
          </h2>

          <div>
            <label htmlFor="devoirTitre" className="block text-xs font-semibold text-slate-700">
              Intitulé du devoir
            </label>
            <input
              id="devoirTitre"
              type="text"
              value={devoirTitre}
              onChange={(e) => setDevoirTitre(e.target.value)}
              placeholder="Ex : Exercices de Maths — Chapitre 3"
              className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="devoirClasse" className="block text-xs font-semibold text-slate-700">
                Classe ciblée
              </label>
              <select
                id="devoirClasse"
                value={devoirClasse}
                onChange={(e) => setDevoirClasse(e.target.value)}
                className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="CM2">CM2</option>
                <option value="3ème">3ème</option>
                <option value="Terminale D">Terminale D</option>
                <option value="Licence 2">Licence 2</option>
                <option value="Toutes classes">Toutes classes</option>
              </select>
            </div>
            <div>
              <label htmlFor="devoirEcheance" className="block text-xs font-semibold text-slate-700">
                Échéance
              </label>
              <input
                id="devoirEcheance"
                type="text"
                value={devoirEcheance}
                onChange={(e) => setDevoirEcheance(e.target.value)}
                className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          {devoirFeedback && (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{devoirFeedback}</span>
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Diffuser aux élèves</span>
          </button>
        </form>

        {/* Student Roster */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Élèves suivis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Nom</th>
                  <th className="py-2.5 pr-4">Code attribué</th>
                  <th className="py-2.5 pr-4">Classe</th>
                  <th className="py-2.5 pr-4">Dernier quiz</th>
                  <th className="py-2.5 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu.id} className="text-slate-800">
                    <td className="py-3 pr-4 font-semibold">{stu.nom}</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-teal-800">
                      {stu.studentCode}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{stu.classe}</td>
                    <td className="py-3 pr-4 text-xs text-slate-600">{stu.lastQuizScore}</td>
                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      {stu.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => (canReturnToStudentApp ? onNavigate('app') : onBack())}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{canReturnToStudentApp ? 'Retour à l’App Élève' : 'Retour à l’accueil'}</span>
      </button>
    </div>
  );
};
