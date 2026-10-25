import React from 'react';
import { ViewFilter, Contact } from '../types/contact';
import {
  Users,
  Star,
  ShieldAlert,
  GitMerge,
  Upload,
  Download,
  RotateCcw,
  Tag,
  PhoneCall,
  Trash,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentFilter: ViewFilter;
  onSelectFilter: (filter: ViewFilter) => void;
  contacts: Contact[];
  duplicateCount: number;
  onOpenDuplicates: () => void;
  onOpenDialer: () => void;
  onOpenImport: () => void;
  onExportAllVCF: () => void;
  onExportAllCSV: () => void;
  onResetData: () => void;
  onClearAll: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  contacts,
  duplicateCount,
  onOpenDuplicates,
  onOpenDialer,
  onOpenImport,
  onExportAllVCF,
  onExportAllCSV,
  onResetData,
  onClearAll,
  onCloseMobile,
}) => {
  const totalCount = contacts.length;
  const favoritesCount = contacts.filter((c) => c.isFavorite).length;
  const emergencyCount = contacts.filter((c) => c.isEmergency).length;

  // Extract unique tags and their counts
  const tagCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contacts) {
      for (const t of c.tags) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [contacts]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 p-4 select-none">
      {/* App Wordmark */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              Aura Contacts
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Address Book</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Filters */}
      <div className="space-y-1">
        {/* All Contacts */}
        <button
          onClick={() => onSelectFilter({ type: 'all' })}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentFilter.type === 'all'
              ? 'bg-indigo-600/30 text-white font-semibold'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>All Contacts</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            {totalCount}
          </span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => onSelectFilter({ type: 'favorites' })}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentFilter.type === 'favorites'
              ? 'bg-indigo-600/30 text-white font-semibold'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>Favorites</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            {favoritesCount}
          </span>
        </button>

        {/* Emergency */}
        <button
          onClick={() => onSelectFilter({ type: 'emergency' })}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentFilter.type === 'emergency'
              ? 'bg-indigo-600/30 text-white font-semibold'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Emergency Contacts</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            {emergencyCount}
          </span>
        </button>
      </div>

      {/* Quick Launchpad: Dialer & Duplicates */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenDialer}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-white transition-colors"
        >
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>Keypad & Dialer</span>
        </button>

        {duplicateCount > 0 && (
          <button
            onClick={onOpenDuplicates}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-amber-400" />
              <span>Review Duplicates</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-sm bg-amber-500/20 text-amber-300 font-mono text-[10px]">
              {duplicateCount}
            </span>
          </button>
        )}
      </div>

      {/* Tags & Groups Section */}
      {tagCounts.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex-1 overflow-y-auto min-h-0">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Tags & Groups
          </span>
          <div className="space-y-0.5">
            {tagCounts.slice(0, 10).map(([tag, count]) => {
              const isActive = currentFilter.type === 'tag' && currentFilter.tag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectFilter({ type: 'tag', tag })}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{tag}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums ml-1">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Utilities (Import, Export, Reset) */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-1.5 text-xs shrink-0">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenImport}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-[11px] font-medium transition-colors"
            title="Import .vcf or .csv"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import</span>
          </button>

          <div className="relative group">
            <button
              onClick={onExportAllVCF}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-[11px] font-medium transition-colors"
              title="Export all to .vcf vCard"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .vcf</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 px-1 text-[11px]">
          <button
            onClick={onExportAllCSV}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            Export CSV
          </button>

          <button
            onClick={onResetData}
            className="text-slate-400 hover:text-indigo-400 flex items-center gap-1"
            title="Reset to sample dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => {
              if (confirm('Clear all contacts from your local address book?')) {
                onClearAll();
              }
            }}
            className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto"
          >
            <Trash className="w-3 h-3" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
