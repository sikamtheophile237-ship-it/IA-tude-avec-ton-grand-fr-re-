import React, {useState} from 'react';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  School,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {getLevelInfo, LEVEL_GROUPS, TRANSLATIONS} from '../data/curriculum';
import {Language} from '../types';

interface AuthLandingProps {
  lang: Language;
  onLoginStudent: (phone: string, pass: string) => string | null;
  onRegisterStudent: (payload: {
    nom: string;
    phone: string;
    password: string;
    classe: string;
    enableVoice: boolean;
  }) => string | null;
  onOpenParent: (phoneOrCode: string, parentName?: string) => string | null;
  onOpenSchool: (schoolName: string) => void;
  onLoginAdmin: (phone: string, pass: string, secret: string) => string | null;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  lang,
  onLoginStudent,
  onRegisterStudent,
  onOpenParent,
  onOpenSchool,
  onLoginAdmin,
}) => {
  const t = TRANSLATIONS[lang];
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Student Login
  const [loginPhone, setLoginPhone] = useState('690123456');
  const [loginPass, setLoginPass] = useState('1234');
  const [loginError, setLoginError] = useState('');

  // Student Register
  const [regNom, setRegNom] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regClasse, setRegClasse] = useState('3ème');
  const [regVoice, setRegVoice] = useState(true);
  const [regError, setRegError] = useState('');

  // Parent / School / Admin portals
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('690123456');
  const [parentError, setParentError] = useState('');
  const [schoolName, setSchoolName] = useState('Lycée de Ngaoundéré');
  const [adminPhone, setAdminPhone] = useState('690123456');
  const [adminPass, setAdminPass] = useState('admin2026');
  const [adminSecret, setAdminSecret] = useState('SISTO-ADMIN-2026');
  const [adminError, setAdminError] = useState('');

  const selectedLevel = getLevelInfo(regClasse);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onLoginStudent(loginPhone.trim(), loginPass);
    setLoginError(err || '');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNom.trim() || !regPhone.trim() || !regPass.trim()) {
      setRegError('Remplis ton nom, ton numéro et ton mot de passe.');
      return;
    }
    const err = onRegisterStudent({
      nom: regNom.trim(),
      phone: regPhone.trim(),
      password: regPass,
      classe: regClasse,
      enableVoice: regVoice,
    });
    setRegError(err || '');
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onOpenParent(parentPhone.trim(), parentName.trim());
    setParentError(err || '');
  };

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenSchool(schoolName.trim() || 'Lycée de Ngaoundéré');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onLoginAdmin(adminPhone.trim(), adminPass, adminSecret.trim());
    setAdminError(err || '');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Split */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="relative h-64 sm:h-80 lg:h-72 w-full bg-slate-900">
            <img
              src="/src/assets/images/hero_cameroon_campus_1795124969483.jpg"
              alt="Étudiants camerounais révisant ensemble à Ngaoundéré"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 text-white">
              <p className="text-xs font-medium text-slate-200">
                Ngaoundéré · Cameroun · De la SIL au Master 2
              </p>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {t.heroTitle}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 gap-6">
            <p className="text-base leading-relaxed text-slate-600">{t.heroSubtitle}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs text-slate-500">Primaire (SIL–CM2)</p>
                <p className="mt-0.5 font-mono text-base font-semibold text-slate-900 tabular-nums">
                  500F / mois
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Collège (6ème–3ème)</p>
                <p className="mt-0.5 font-mono text-base font-semibold text-slate-900 tabular-nums">
                  1000F / mois
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Lycée (2nde–Tle)</p>
                <p className="mt-0.5 font-mono text-base font-semibold text-slate-900 tabular-nums">
                  1500F / mois
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Université (L1–M2)</p>
                <p className="mt-0.5 font-mono text-base font-semibold text-slate-900 tabular-nums">
                  2000F / mois
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {authTab === 'login' ? t.loginStudent : t.createAccount}
              </h2>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    authTab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    authTab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="loginPhone"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Téléphone ou Code élève
                  </label>
                  <input
                    id="loginPhone"
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="Ex : 690123456 ou ELV-2026-1042"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="loginPass"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="loginPass"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {loginError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  <span>{t.connectBtn}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <p className="text-center text-xs text-slate-500">
                  Compte démo prêt : <span className="font-mono font-medium">690123456 / 1234</span>{' '}
                  (Emmanuel · 3ème)
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="regNom"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Prénom & Nom
                    </label>
                    <input
                      id="regNom"
                      type="text"
                      value={regNom}
                      onChange={(e) => setRegNom(e.target.value)}
                      placeholder="Ex : Emmanuel"
                      className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="regPhone"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Téléphone
                    </label>
                    <input
                      id="regPhone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="690000000"
                      className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="regPass"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Mot de passe
                    </label>
                    <input
                      id="regPass"
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="4 chiffres min."
                      className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="regClasse"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Classe (SIL à Master 2)
                    </label>
                    <select
                      id="regClasse"
                      value={regClasse}
                      onChange={(e) => setRegClasse(e.target.value)}
                      className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      {LEVEL_GROUPS.map((grp) => (
                        <optgroup key={grp.label} label={grp.label}>
                          {grp.items.map((item) => (
                            <option key={item.classe} value={item.classe}>
                              {item.classe}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs font-medium text-blue-900">
                  {selectedLevel.cycle} · Objectif : {selectedLevel.exam} · Tarif :{' '}
                  <span className="font-mono font-semibold">{selectedLevel.price}F/mois</span>
                </div>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regVoice}
                    onChange={(e) => setRegVoice(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700"
                  />
                  <span>Activer la voix de Sisto automatiquement</span>
                </label>

                {regError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {regError}
                  </p>
                )}

                <button
                  type="submit"
                  className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
                >
                  <span>{t.registerBtn}</span>
                </button>
                <p className="text-center text-[11px] text-slate-500">
                  Un code élève personnel (<span className="font-mono">ELV-2026-XXXX</span>) est
                  attribué automatiquement dès la création du compte.
                </p>
              </form>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-3 text-xs text-slate-500">
            <BookOpen className="h-4 w-4 text-blue-700 shrink-0" aria-hidden="true" />
            <span>
              Voix Grand Frère / Grande Sœur · Fonctionne hors-ligne · Français, Fulfulde, English
            </span>
          </div>
        </div>
      </section>

      {/* Portals Row: Parents, École, Super Admin */}
      <section aria-label="Portails dédiés" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Parents */}
        <form
          onSubmit={handleParentSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5 text-slate-900">
              <Users className="h-5 w-5 text-violet-700" aria-hidden="true" />
              <h3 className="text-lg font-bold">{t.parentSpace}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Consulte le temps de révision, les notes et les SMS du soir en Français ou Fulfulde.
            </p>
            <div className="mt-4 space-y-2.5">
              <div>
                <label htmlFor="parentNameInput" className="block text-xs font-semibold text-slate-700">
                  Votre nom (Parent)
                </label>
                <input
                  id="parentNameInput"
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Ex : M. Ibrahim Moussa"
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-violet-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="parentPhone" className="block text-xs font-semibold text-slate-700">
                  Numéro ou Code de l’enfant / Parent
                </label>
                <input
                  id="parentPhone"
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Ex : 690123456 ou PAR-2026-4812"
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-violet-600 focus:outline-none"
                />
              </div>
            </div>
            {parentError && (
              <p className="mt-2 text-xs font-medium text-red-600">{parentError}</p>
            )}
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 transition-colors"
          >
            Voir les progrès de mon enfant
          </button>
        </form>

        {/* École */}
        <form
          onSubmit={handleSchoolSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5 text-slate-900">
              <School className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h3 className="text-lg font-bold">{t.schoolSpace}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Suivi des effectifs, moyenne de classe et diffusion de devoirs à tous les élèves.
            </p>
            <div className="mt-4">
              <label htmlFor="schoolInput" className="block text-xs font-semibold text-slate-700">
                Nom de l’établissement
              </label>
              <input
                id="schoolInput"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Lycée de Ngaoundéré"
                className="mt-1 w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
          >
            Ouvrir l’espace établissement
          </button>
        </form>

        {/* Super Admin */}
        <form
          onSubmit={handleAdminSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-orange-400" aria-hidden="true" />
              <h3 className="text-lg font-bold">{t.adminSpace}</h3>
            </div>
            <p className="mt-1.5 text-xs text-slate-300">
              Revenus Mobile Money, élèves inscrits, certificats et établissements partenaires.
            </p>
            <div className="mt-3 space-y-2">
              <input
                type="tel"
                aria-label="Téléphone admin"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full min-h-[38px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-orange-400 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  aria-label="Mot de passe admin"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full min-h-[38px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-orange-400 focus:outline-none"
                />
                <input
                  type="text"
                  aria-label="Clé secrète admin"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full min-h-[38px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-xs text-white focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>
            {adminError && (
              <p className="mt-2 text-xs font-medium text-red-400">{adminError}</p>
            )}
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Entrer en Super Admin</span>
          </button>
        </form>
      </section>
    </div>
  );
};
