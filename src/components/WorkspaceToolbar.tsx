import React from 'react';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {TRANSLATIONS} from '../data/curriculum';
import {Language} from '../types';

interface WorkspaceToolbarProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  isOnline: boolean;
  simulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  offlinePackSaved: boolean;
  onDownloadOffline: () => void;
  pendingPaymentsCount: number;
  pendingPointsCount: number;
  onSyncNow: () => void;
  voiceMuted: boolean;
  onToggleMute: () => void;
  showInstallButton: boolean;
  onInstallApp: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  lang,
  onChangeLang,
  isOnline,
  simulatedOffline,
  onToggleSimulatedOffline,
  offlinePackSaved,
  onDownloadOffline,
  pendingPaymentsCount,
  pendingPointsCount,
  onSyncNow,
  voiceMuted,
  onToggleMute,
  showInstallButton,
  onInstallApp,
}) => {
  const t = TRANSLATIONS[lang];
  const hasPendingSync = pendingPaymentsCount > 0 || pendingPointsCount > 0;

  return (
    <section
      aria-label="Barre d'outils langue et mode hors-ligne"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div
          role="group"
          aria-label="Sélection de langue"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          {(
            [
              {code: 'fr', label: 'Français'},
              {code: 'ff', label: 'Fulfulde'},
              {code: 'en', label: 'English'},
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onChangeLang(item.code)}
              className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                lang === item.code
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSimulatedOffline}
            title="Basculer entre le mode En ligne et Hors-ligne"
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              isOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isOnline ? t.onlineLabel : t.offlineLabel}</span>
            {simulatedOffline && <span className="text-[11px] opacity-75">(Simulé)</span>}
          </button>

          <button
            type="button"
            onClick={onDownloadOffline}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              offlinePackSaved
                ? 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {offlinePackSaved ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{offlinePackSaved ? t.offlineDownloaded : t.downloadOffline}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              voiceMuted
                ? 'border-slate-300 bg-slate-100 text-slate-600'
                : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}
          >
            {voiceMuted ? (
              <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{voiceMuted ? 'Voix OFF' : 'Voix ON'}</span>
          </button>

          {showInstallButton && (
            <button
              type="button"
              onClick={onInstallApp}
              className="hidden sm:inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-blue-700 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 whitespace-nowrap hover:bg-blue-50 transition-colors"
            >
              <span>{t.installApp}</span>
            </button>
          )}
        </div>
      </div>

      {(!isOnline || hasPendingSync) && (
        <div className="border-t border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-amber-950 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">
                {!isOnline
                  ? 'Mode Hors-ligne actif : tes cours et quiz restent disponibles.'
                  : 'Données prêtes à synchroniser :'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {pendingPaymentsCount} paiement(s) · {pendingPointsCount} pts en attente
              </span>
            </div>
            {hasPendingSync && (
              <button
                type="button"
                onClick={onSyncNow}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>{t.syncNow}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
