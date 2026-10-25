import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Contact, ViewFilter, SortOption, InteractionType } from './types/contact';
import { INITIAL_CONTACTS } from './data/initialContacts';
import { findDuplicates, DuplicateGroup } from './utils/helpers';
import { exportContactsToVCF, exportContactsToCSV } from './utils/vcard';
import { Sidebar } from './components/Sidebar';
import { ContactList } from './components/ContactList';
import { ContactDetail } from './components/ContactDetail';
import { ContactFormModal } from './components/ContactFormModal';
import { QRCodeModal } from './components/QRCodeModal';
import { DialerModal } from './components/DialerModal';
import { DuplicatesModal } from './components/DuplicatesModal';
import { QuickImportModal } from './components/QuickImportModal';
import { InteractionModal } from './components/InteractionModal';
import { Menu, Plus, PhoneCall, Sparkles, UserPlus } from 'lucide-react';

const STORAGE_KEY = 'aura_contacts_v1';

export default function App() {
  // Load contacts from LocalStorage or use realistic sample data
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load contacts from localStorage', e);
    }
    return INITIAL_CONTACTS;
  });

  // Selected contact ID
  const [selectedContactId, setSelectedContactId] = useState<string | null>(() => {
    return INITIAL_CONTACTS[0]?.id || null;
  });

  // Filters & Sorting
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('first-name-asc');

  // Modals state
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [initialPhoneNumberForNew, setInitialPhoneNumberForNew] = useState<string | undefined>();
  const [qrModalContact, setQrModalContact] = useState<Contact | null>(null);
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [isDuplicatesOpen, setIsDuplicatesOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [interactionModalContact, setInteractionModalContact] = useState<Contact | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile navigation state
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to persist contacts to localStorage', e);
    }
  }, [contacts]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingContact(null);
        setInitialPhoneNumberForNew(undefined);
        setIsContactFormOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsDialerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute duplicate groups
  const duplicateGroups: DuplicateGroup[] = useMemo(() => {
    return findDuplicates(contacts);
  }, [contacts]);

  // Filtered & Sorted contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Filter by view type
    if (currentFilter.type === 'favorites') {
      result = result.filter((c) => c.isFavorite);
    } else if (currentFilter.type === 'emergency') {
      result = result.filter((c) => c.isEmergency);
    } else if (currentFilter.type === 'tag') {
      result = result.filter((c) => c.tags.includes(currentFilter.tag));
    } else if (currentFilter.type === 'company') {
      result = result.filter((c) => c.company === currentFilter.company);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const nickname = (c.nickname || '').toLowerCase();
        const company = (c.company || '').toLowerCase();
        const jobTitle = (c.jobTitle || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();
        const tags = c.tags.map((t) => t.toLowerCase()).join(' ');
        const phones = c.phones.map((p) => p.number.replace(/\D/g, '')).join(' ');
        const rawPhones = c.phones.map((p) => p.number.toLowerCase()).join(' ');
        const emails = c.emails.map((e) => e.email.toLowerCase()).join(' ');

        return (
          fullName.includes(q) ||
          nickname.includes(q) ||
          company.includes(q) ||
          jobTitle.includes(q) ||
          notes.includes(q) ||
          tags.includes(q) ||
          phones.includes(q.replace(/\D/g, '')) ||
          rawPhones.includes(q) ||
          emails.includes(q)
        );
      });
    }

    // Sort contacts
    result.sort((a, b) => {
      if (sortOption === 'first-name-asc') {
        return (a.firstName || a.lastName).localeCompare(b.firstName || b.lastName);
      }
      if (sortOption === 'last-name-asc') {
        return (a.lastName || a.firstName).localeCompare(b.lastName || b.firstName);
      }
      if (sortOption === 'recently-added') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'recently-updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

    return result;
  }, [contacts, currentFilter, searchQuery, sortOption]);

  // Selected Contact
  const selectedContact = useMemo(() => {
    if (!selectedContactId) return filteredContacts[0] || null;
    return contacts.find((c) => c.id === selectedContactId) || filteredContacts[0] || null;
  }, [contacts, selectedContactId, filteredContacts]);

  // Handlers
  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setShowMobileDetail(true);
  };

  const handleSaveContact = (contact: Contact) => {
    const existingIndex = contacts.findIndex((c) => c.id === contact.id);
    if (existingIndex >= 0) {
      const updated = [...contacts];
      updated[existingIndex] = contact;
      setContacts(updated);
      showToast(`Updated "${contact.firstName} ${contact.lastName}".`);
    } else {
      setContacts([contact, ...contacts]);
      showToast(`Created contact "${contact.firstName} ${contact.lastName}".`);
    }
    setSelectedContactId(contact.id);
  };

  const handleDeleteContact = (contactId: string) => {
    const target = contacts.find((c) => c.id === contactId);
    const updated = contacts.filter((c) => c.id !== contactId);
    setContacts(updated);
    if (selectedContactId === contactId) {
      setSelectedContactId(updated[0]?.id || null);
      setShowMobileDetail(false);
    }
    showToast(`Removed ${target?.firstName || 'contact'}.`);
  };

  const handleToggleFavorite = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          const nextFav = !c.isFavorite;
          showToast(nextFav ? `Added ${c.firstName} to favorites` : `Removed from favorites`);
          return { ...c, isFavorite: nextFav, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  const handleBulkDelete = (ids: string[]) => {
    setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
    if (selectedContactId && ids.includes(selectedContactId)) {
      setSelectedContactId(null);
    }
    showToast(`Deleted ${ids.length} contacts.`);
  };

  const handleBulkExport = (ids: string[]) => {
    const targets = contacts.filter((c) => ids.includes(c.id));
    const vcf = exportContactsToVCF(targets);
    downloadFile(vcf, `contacts_export_${targets.length}.vcf`, 'text/vcard;charset=utf-8;');
    showToast(`Exported ${targets.length} contacts.`);
  };

  const handleExportAllVCF = () => {
    const vcf = exportContactsToVCF(contacts);
    downloadFile(vcf, `aura_address_book_${contacts.length}.vcf`, 'text/vcard;charset=utf-8;');
    showToast(`Exported all ${contacts.length} contacts to .vcf.`);
  };

  const handleExportAllCSV = () => {
    const csv = exportContactsToCSV(contacts);
    downloadFile(csv, `aura_address_book_${contacts.length}.csv`, 'text/csv;charset=utf-8;');
    showToast(`Exported all ${contacts.length} contacts to CSV.`);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMergeDuplicates = (mergedContact: Contact, discardedIds: string[]) => {
    setContacts((prev) => {
      const filtered = prev.filter((c) => !discardedIds.includes(c.id) && c.id !== mergedContact.id);
      return [mergedContact, ...filtered];
    });
    setSelectedContactId(mergedContact.id);
    showToast(`Successfully merged duplicates.`);
  };

  const handleImportContacts = (imported: Contact[]) => {
    setContacts((prev) => [...imported, ...prev]);
    if (imported[0]) {
      setSelectedContactId(imported[0].id);
    }
    showToast(`Imported ${imported.length} new contacts.`);
  };

  const handleAddInteraction = (
    contactId: string,
    interaction: {
      id: string;
      timestamp: string;
      type: InteractionType;
      summary: string;
      duration?: string;
    }
  ) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            interactions: [interaction, ...c.interactions],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    showToast('Recorded new touchpoint.');
  };

  const handleResetData = () => {
    setContacts(INITIAL_CONTACTS);
    setSelectedContactId(INITIAL_CONTACTS[0]?.id || null);
    showToast('Address book reset to sample contacts.');
  };

  const handleClearAll = () => {
    setContacts([]);
    setSelectedContactId(null);
    showToast('All contacts cleared.');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-sm font-bold tracking-tight text-slate-900">Aura Contacts</span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsDialerOpen(true)}
            className="p-2 text-slate-600 hover:text-emerald-600"
            title="Keypad"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingContact(null);
              setInitialPhoneNumberForNew(undefined);
              setIsContactFormOpen(true);
            }}
            className="p-2 text-slate-900 hover:text-indigo-600"
            title="New contact"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Sidebar) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-50">
            <Sidebar
              currentFilter={currentFilter}
              onSelectFilter={(f) => {
                setCurrentFilter(f);
                setIsMobileMenuOpen(false);
                setShowMobileDetail(false);
              }}
              contacts={contacts}
              duplicateCount={duplicateGroups.length}
              onOpenDuplicates={() => {
                setIsMobileMenuOpen(false);
                setIsDuplicatesOpen(true);
              }}
              onOpenDialer={() => {
                setIsMobileMenuOpen(false);
                setIsDialerOpen(true);
              }}
              onOpenImport={() => {
                setIsMobileMenuOpen(false);
                setIsImportOpen(true);
              }}
              onExportAllVCF={handleExportAllVCF}
              onExportAllCSV={handleExportAllCSV}
              onResetData={handleResetData}
              onClearAll={handleClearAll}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Leftmost Column) */}
      <div className="hidden md:block w-64 lg:w-72 shrink-0 h-full">
        <Sidebar
          currentFilter={currentFilter}
          onSelectFilter={(f) => setCurrentFilter(f)}
          contacts={contacts}
          duplicateCount={duplicateGroups.length}
          onOpenDuplicates={() => setIsDuplicatesOpen(true)}
          onOpenDialer={() => setIsDialerOpen(true)}
          onOpenImport={() => setIsImportOpen(true)}
          onExportAllVCF={handleExportAllVCF}
          onExportAllCSV={handleExportAllCSV}
          onResetData={handleResetData}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Middle & Right Panes */}
      <div className="flex-1 flex flex-col md:flex-row h-full pt-14 md:pt-0 overflow-hidden">
        {/* Contact List (Middle Column) */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
            showMobileDetail ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ContactList
            contacts={filteredContacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
            onOpenNewContact={() => {
              setEditingContact(null);
              setInitialPhoneNumberForNew(undefined);
              setIsContactFormOpen(true);
            }}
            onToggleFavorite={handleToggleFavorite}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
            searchRef={searchInputRef}
          />
        </div>

        {/* Contact Dossier / Detail (Rightmost Main Viewport) */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            showMobileDetail ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedContact ? (
            <ContactDetail
              contact={selectedContact}
              onEdit={(c) => {
                setEditingContact(c);
                setIsContactFormOpen(true);
              }}
              onDelete={handleDeleteContact}
              onToggleFavorite={handleToggleFavorite}
              onOpenQR={(c) => setQrModalContact(c)}
              onOpenDialer={(phoneNum) => {
                setIsDialerOpen(true);
              }}
              onOpenLogInteraction={(c) => setInteractionModalContact(c)}
              onBackMobile={() => setShowMobileDetail(false)}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4 border border-slate-100">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">No Contact Selected</h2>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Select a person from the list or add a new contact to see their complete profile dossier.
              </p>
              <button
                onClick={() => {
                  setEditingContact(null);
                  setInitialPhoneNumberForNew(undefined);
                  setIsContactFormOpen(true);
                }}
                className="py-2.5 px-5 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Add First Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isContactFormOpen && (
        <ContactFormModal
          initialContact={editingContact}
          initialPhoneNumber={initialPhoneNumberForNew}
          onSave={handleSaveContact}
          onClose={() => {
            setIsContactFormOpen(false);
            setEditingContact(null);
            setInitialPhoneNumberForNew(undefined);
          }}
        />
      )}

      {qrModalContact && (
        <QRCodeModal
          contact={qrModalContact}
          onClose={() => setQrModalContact(null)}
        />
      )}

      {isDialerOpen && (
        <DialerModal
          contacts={contacts}
          onClose={() => setIsDialerOpen(false)}
          onSelectContact={(c) => {
            setSelectedContactId(c.id);
            setShowMobileDetail(true);
          }}
          onCreateContactWithNumber={(num) => {
            setEditingContact(null);
            setInitialPhoneNumberForNew(num);
            setIsContactFormOpen(true);
          }}
          onLogInteraction={(cId, summary, duration) => {
            handleAddInteraction(cId, {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toISOString(),
              type: 'call',
              summary,
              duration,
            });
          }}
        />
      )}

      {isDuplicatesOpen && (
        <DuplicatesModal
          duplicateGroups={duplicateGroups}
          onMerge={handleMergeDuplicates}
          onClose={() => setIsDuplicatesOpen(false)}
        />
      )}

      {isImportOpen && (
        <QuickImportModal
          onImport={handleImportContacts}
          onClose={() => setIsImportOpen(false)}
        />
      )}

      {interactionModalContact && (
        <InteractionModal
          contact={interactionModalContact}
          onAddInteraction={handleAddInteraction}
          onClose={() => setInteractionModalContact(null)}
        />
      )}
    </div>
  );
}
