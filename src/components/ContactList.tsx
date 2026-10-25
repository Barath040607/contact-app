import React, { useState, useMemo } from 'react';
import { Contact, SortOption } from '../types/contact';
import { formatFullName, formatPhoneNumber, getInitials } from '../utils/helpers';
import {
  Search,
  Star,
  ShieldAlert,
  ArrowUpDown,
  CheckSquare,
  Square,
  Trash2,
  Download,
  UserPlus,
  X,
  Phone,
} from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  onOpenNewContact: () => void;
  onToggleFavorite: (contactId: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkExport: (ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
  onOpenNewContact,
  onToggleFavorite,
  onBulkDelete,
  onBulkExport,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  searchRef,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Group contacts by first letter for alphabetical jumps
  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: Contact[] } = {};
    for (const c of contacts) {
      const name = c.firstName || c.lastName || '#';
      const letter = name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }, [contacts]);

  const availableLetters = Object.keys(groupedContacts).sort();

  const handleToggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)));
    }
  };

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`letter-group-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Top Search & Actions Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Contacts</span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              ({contacts.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                if (isBulkMode) setSelectedIds(new Set());
              }}
              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isBulkMode
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'text-slate-600 border-transparent hover:bg-slate-100'
              }`}
              title="Toggle multi-select"
            >
              {isBulkMode ? 'Done' : 'Select'}
            </button>

            <button
              onClick={onOpenNewContact}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email, company, tag... (/)"
            className="w-full text-xs pl-8 pr-7 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Bulk Controls Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          {isBulkMode ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-indigo-600"
              >
                {selectedIds.size === contacts.length && contacts.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedIds.size === 0
                    ? 'Select All'
                    : `${selectedIds.size} selected`}
                </span>
              </button>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBulkExport(Array.from(selectedIds))}
                    className="p-1 text-slate-600 hover:text-indigo-600 rounded"
                    title="Export selected vCards"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${selectedIds.size} contacts?`)) {
                        onBulkDelete(Array.from(selectedIds));
                        setSelectedIds(new Set());
                      }
                    }}
                    className="p-1 text-slate-600 hover:text-rose-600 rounded"
                    title="Delete selected"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="text-[11px] bg-transparent font-medium text-slate-600 hover:text-slate-900 border-none focus:outline-none cursor-pointer"
                >
                  <option value="first-name-asc">First Name (A-Z)</option>
                  <option value="last-name-asc">Last Name (A-Z)</option>
                  <option value="recently-added">Recently Added</option>
                  <option value="recently-updated">Recently Updated</option>
                </select>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact List Body with Alphabetical Side Jump */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {contacts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <p className="text-xs text-slate-500 mb-3">No contacts match your query.</p>
              <button
                onClick={onOpenNewContact}
                className="py-1.5 px-3 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
              >
                Add new contact
              </button>
            </div>
          ) : (
            availableLetters.map((letter) => (
              <div key={letter} id={`letter-group-${letter}`}>
                {/* Group Letter Header */}
                <div className="sticky top-0 z-10 px-4 py-1 bg-slate-50/90 backdrop-blur-xs border-b border-slate-100 text-[11px] font-bold text-slate-500 font-mono uppercase">
                  {letter}
                </div>

                {groupedContacts[letter].map((contact) => {
                  const isSelected = contact.id === selectedContactId;
                  const isChecked = selectedIds.has(contact.id);
                  const fullName = formatFullName(contact);
                  const subtext =
                    contact.jobTitle && contact.company
                      ? `${contact.jobTitle} · ${contact.company}`
                      : contact.company || contact.phones[0]?.number || contact.emails[0]?.email;

                  return (
                    <div
                      key={contact.id}
                      onClick={() => onSelectContact(contact)}
                      className={`flex items-center justify-between px-3.5 py-3 cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-indigo-50/80 text-indigo-950 border-l-2 border-indigo-600 pl-[12px]'
                          : 'hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {/* Checkbox for bulk mode */}
                        {isBulkMode && (
                          <button
                            onClick={(e) => handleToggleSelectId(contact.id, e)}
                            className="text-slate-400 hover:text-indigo-600 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: contact.avatarColor }}
                        >
                          {getInitials(contact.firstName, contact.lastName)}
                        </div>

                        {/* Info */}
                        <div className="overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {fullName}
                            </span>
                            {contact.isEmergency && (
                              <span title="Emergency Contact" className="shrink-0 flex items-center">
                                <ShieldAlert className="w-3 h-3 text-rose-500" />
                              </span>
                            )}
                          </div>
                          {subtext && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {subtext}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right icons: favorite star */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {contact.isFavorite && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        )}
                        {!contact.isFavorite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(contact.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-amber-500 transition-opacity"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Side Alphabet Index Bar */}
        {contacts.length > 8 && (
          <div className="w-4.5 py-2 flex flex-col items-center justify-center text-[9px] font-semibold text-slate-400 select-none bg-slate-50/50 border-l border-slate-100">
            {availableLetters.map((l) => (
              <button
                key={l}
                onClick={() => scrollToLetter(l)}
                className="w-full py-0.5 text-center hover:text-indigo-600 hover:font-bold"
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
