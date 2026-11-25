import React from 'react';
import {
  CreditCard,
  GraduationCap,
  LogOut,
  MessageSquare,
  School,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import {ActivePage} from '../types';

interface TopBarProps {
  activePage: ActivePage;
  isStudentLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
  onInstallClick: () => void;
  showInstallButton: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  isStudentLoggedIn,
  isAdminLoggedIn,
  onNavigate,
  onLogout,
  onInstallClick,
  showInstallButton,
}) => {
  const navItems: {id: ActivePage; label: string; show: boolean}[] = [
    {id: 'app', label: 'App Élève', show: isStudentLoggedIn},
    {id: 'paiement', label: 'Paiement', show: true},
    {id: 'parent', label: 'Parents', show: true},
    {id: 'ecole', label: 'École', show: true},
    {id: 'profil', label: 'Profil', show: isStudentLoggedIn},
    {id: 'admin', label: 'Admin', show: isAdminLoggedIn},
  ];

  const visibleNav = navItems.filter((item) => item.show);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate(isStudentLoggedIn ? 'app' : 'login')}
            className="whitespace-nowrap shrink-0 text-left text-lg font-extrabold tracking-tight text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            SISTO MASTER
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {!isStudentLoggedIn && (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors ${
                  activePage === 'login'
                    ? 'border-blue-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Connexion
              </button>
            )}
            {visibleNav.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors ${
                  activePage === item.id
                    ? 'border-blue-700 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {isStudentLoggedIn || isAdminLoggedIn ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Déconnexion</span>
              </button>
            ) : showInstallButton ? (
              <button
                type="button"
                onClick={onInstallClick}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-800 transition-colors"
              >
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Installer l’app</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-blue-800 transition-colors"
              >
                <span>Commencer</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {isStudentLoggedIn && (
        <nav
          aria-label="Navigation mobile"
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
        >
          <div className="grid grid-cols-5 h-14">
            <button
              type="button"
              onClick={() => onNavigate('app')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                activePage === 'app' ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              <span>App</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('paiement')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                activePage === 'paiement' ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <span>Paiement</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('parent')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                activePage === 'parent' ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Parents</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ecole')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                activePage === 'ecole' ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <School className="h-4 w-4" aria-hidden="true" />
              <span>École</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate(isAdminLoggedIn ? 'admin' : 'profil')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                activePage === 'profil' || activePage === 'admin'
                  ? 'text-blue-700'
                  : 'text-slate-500'
              }`}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <User className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isAdminLoggedIn ? 'Admin' : 'Profil'}</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};
