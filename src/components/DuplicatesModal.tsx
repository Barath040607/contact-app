import React, { useState } from 'react';
import { Contact } from '../types/contact';
import { DuplicateGroup, formatFullName, getInitials, mergeContacts } from '../utils/helpers';
import { X, GitMerge, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface DuplicatesModalProps {
  duplicateGroups: DuplicateGroup[];
  onMerge: (mergedContact: Contact, discardedIds: string[]) => void;
  onClose: () => void;
}

export const DuplicatesModal: React.FC<DuplicatesModalProps> = ({
  duplicateGroups,
  onMerge,
  onClose,
}) => {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentGroup = duplicateGroups[activeGroupIndex];

  const handleMergeGroup = () => {
    if (!currentGroup || currentGroup.contacts.length < 2) return;
    const primary = currentGroup.contacts[0];
    const secondary = currentGroup.contacts[1];

    const merged = mergeContacts(primary, secondary);
    const discardedIds = [secondary.id];

    onMerge(merged, discardedIds);
    setSuccessMessage(`Merged into "${formatFullName(merged)}"`);
    setTimeout(() => {
      setSuccessMessage(null);
      if (activeGroupIndex >= duplicateGroups.length - 1) {
        onClose();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Merge Duplicate Contacts</h3>
              <p className="text-xs text-slate-500">
                {duplicateGroups.length} duplicate cluster{duplicateGroups.length === 1 ? '' : 's'} detected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {duplicateGroups.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Your address book is clean</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              No duplicate names, emails, or phone numbers detected in your contacts list.
            </p>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Cluster Reason Banner */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{currentGroup.reason}</span>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.contacts.slice(0, 2).map((c, idx) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {getInitials(c.firstName, c.lastName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{formatFullName(c)}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                          {idx === 0 ? 'Primary' : 'Duplicate'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{c.jobTitle || c.company || 'No title'}</p>
                    </div>
                  </div>

                  {/* Contact Fields Summary */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                      <span className="text-slate-700 font-mono">
                        {c.phones.map((p) => p.number).join(', ') || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
                      <span className="text-slate-700">{c.emails.map((e) => e.email).join(', ') || '—'}</span>
                    </div>

                    {c.company && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Company</span>
                        <span className="text-slate-700">{c.company}</span>
                      </div>
                    )}

                    {c.tags.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tags</span>
                        <span className="text-slate-600">{c.tags.join(' · ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Merging will combine all phone numbers, email addresses, tags, and interaction histories into a single unified contact card without deleting any unique data.
            </p>
          </div>
        )}

        {/* Footer */}
        {duplicateGroups.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Cluster {activeGroupIndex + 1} of {duplicateGroups.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Dismiss
              </button>

              <button
                onClick={handleMergeGroup}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-colors shadow-xs"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Merge These Two</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
