import React, { useState } from 'react';
import { Contact, InteractionType } from '../types/contact';
import { formatFullName, generateId } from '../utils/helpers';
import { X, Phone, Mail, MessageSquare, Users, FileText } from 'lucide-react';

interface InteractionModalProps {
  contact: Contact;
  onAddInteraction: (contactId: string, interaction: {
    id: string;
    timestamp: string;
    type: InteractionType;
    summary: string;
    duration?: string;
  }) => void;
  onClose: () => void;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  contact,
  onAddInteraction,
  onClose,
}) => {
  const [type, setType] = useState<InteractionType>('call');
  const [summary, setSummary] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    onAddInteraction(contact.id, {
      id: generateId(),
      timestamp: new Date().toISOString(),
      type,
      summary: summary.trim(),
      duration: duration.trim() || undefined,
    });
    onClose();
  };

  const types: { key: InteractionType; label: string; icon: React.ReactNode }[] = [
    { key: 'call', label: 'Phone Call', icon: <Phone className="w-3.5 h-3.5" /> },
    { key: 'meeting', label: 'Meeting', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { key: 'message', label: 'Message', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'note', label: 'Memo / Note', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Log Interaction</h3>
            <p className="text-xs text-slate-500">Record touchpoint with {formatFullName(contact)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Interaction Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {types.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                    type === t.key
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.icon}
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Summary / Notes</label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What was discussed or decided?"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Duration (optional for call/meeting) */}
          {(type === 'call' || type === 'meeting') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration (optional)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 15 mins, 1 hour"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
