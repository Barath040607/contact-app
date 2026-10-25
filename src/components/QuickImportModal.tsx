import React, { useState } from 'react';
import { Contact } from '../types/contact';
import { parseVCF } from '../utils/vcard';
import { generateId, getDeterministicColor, formatFullName } from '../utils/helpers';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface QuickImportModalProps {
  onImport: (contacts: Contact[]) => void;
  onClose: () => void;
}

export const QuickImportModal: React.FC<QuickImportModalProps> = ({ onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [parsedContacts, setParsedContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processContent = (text: string) => {
    try {
      setError(null);
      if (text.includes('BEGIN:VCARD')) {
        const raw = parseVCF(text);
        if (raw.length === 0) {
          setError('No valid vCard entries found in text.');
          return;
        }
        const finalized: Contact[] = raw.map((c) => ({
          id: c.id || generateId(),
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          nickname: c.nickname || '',
          avatarColor: c.avatarColor || getDeterministicColor(`${c.firstName} ${c.lastName}`),
          company: c.company || '',
          jobTitle: c.jobTitle || '',
          department: c.department || '',
          isFavorite: false,
          isEmergency: false,
          phones: c.phones || [],
          emails: c.emails || [],
          addresses: c.addresses || [],
          urls: c.urls || [],
          birthday: c.birthday || '',
          tags: c.tags || ['Imported'],
          notes: c.notes || '',
          interactions: [],
          customFields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setParsedContacts(finalized);
      } else if (text.includes(',') && text.includes('\n')) {
        // Simple CSV parse
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setError('CSV does not contain data rows.');
          return;
        }
        const finalized: Contact[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          const first = cols[0] || '';
          const last = cols[1] || '';
          const comp = cols[2] || '';
          const title = cols[3] || '';
          const phone = cols[4] || '';
          const email = cols[6] || cols[5] || '';

          if (first || last || phone || email) {
            finalized.push({
              id: generateId(),
              firstName: first,
              lastName: last,
              avatarColor: getDeterministicColor(`${first} ${last}`),
              company: comp,
              jobTitle: title,
              isFavorite: false,
              isEmergency: false,
              phones: phone ? [{ id: generateId(), type: 'mobile', number: phone }] : [],
              emails: email ? [{ id: generateId(), type: 'work', email }] : [],
              addresses: [],
              urls: [],
              tags: ['Imported'],
              notes: '',
              interactions: [],
              customFields: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        setParsedContacts(finalized);
      } else {
        setError('Format not recognized. Please provide a standard .vcf (vCard) or .csv text.');
      }
    } catch {
      setError('Failed to parse file. Please verify formatting.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (parsedContacts.length > 0) {
      onImport(parsedContacts);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Import Contacts</h3>
              <p className="text-xs text-slate-500">Supports Apple/Google .vcf and CSV spreadsheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('file')}
            className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'file' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upload File (.vcf / .csv)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'paste' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'file' && parsedContacts.length === 0 && (
            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20 group">
              <input
                type="file"
                accept=".vcf,.vcard,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Click or drag a file to import</p>
              <p className="text-xs text-slate-400">Supports .vcf vCards, Apple contacts, or CSV export files</p>
            </label>
          )}

          {activeTab === 'paste' && parsedContacts.length === 0 && (
            <div className="space-y-3">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste raw vCard text (BEGIN:VCARD ... END:VCARD) or CSV rows here..."
                rows={7}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={() => processContent(pastedText)}
                disabled={!pastedText.trim()}
                className="py-2 px-4 rounded-xl bg-slate-900 disabled:opacity-30 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Parse Content
              </button>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedContacts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Ready to import ({parsedContacts.length} contacts found)
                </span>
                <button
                  onClick={() => setParsedContacts([])}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Choose another
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/40">
                {parsedContacts.map((c, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="overflow-hidden">
                      <span className="font-semibold text-slate-800 block truncate">{formatFullName(c)}</span>
                      <span className="text-slate-500 truncate block text-[11px]">
                        {c.phones[0]?.number || c.emails[0]?.email || c.company || 'No details'}
                      </span>
                    </div>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCommitImport}
            disabled={parsedContacts.length === 0}
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-medium text-white transition-colors shadow-xs"
          >
            Import {parsedContacts.length > 0 ? `(${parsedContacts.length})` : ''} Contacts
          </button>
        </div>
      </div>
    </div>
  );
};
