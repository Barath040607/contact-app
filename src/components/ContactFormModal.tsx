import React, { useState } from 'react';
import { Contact, PhoneEntry, EmailEntry, AddressEntry, UrlEntry, CustomFieldEntry } from '../types/contact';
import { generateId, getDeterministicColor, AVATAR_COLORS } from '../utils/helpers';
import { X, Plus, Trash2, Star, ShieldAlert } from 'lucide-react';

interface ContactFormModalProps {
  initialContact?: Contact | null;
  initialPhoneNumber?: string;
  onSave: (contact: Contact) => void;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  initialContact,
  initialPhoneNumber,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialContact);

  const [firstName, setFirstName] = useState(initialContact?.firstName || '');
  const [lastName, setLastName] = useState(initialContact?.lastName || '');
  const [nickname, setNickname] = useState(initialContact?.nickname || '');
  const [avatarColor, setAvatarColor] = useState(
    initialContact?.avatarColor || getDeterministicColor('New Contact')
  );
  const [avatarUrl, setAvatarUrl] = useState(initialContact?.avatarUrl || '');
  const [company, setCompany] = useState(initialContact?.company || '');
  const [jobTitle, setJobTitle] = useState(initialContact?.jobTitle || '');
  const [department, setDepartment] = useState(initialContact?.department || '');
  const [isFavorite, setIsFavorite] = useState(initialContact?.isFavorite || false);
  const [isEmergency, setIsEmergency] = useState(initialContact?.isEmergency || false);
  const [birthday, setBirthday] = useState(initialContact?.birthday || '');
  const [relationship, setRelationship] = useState(initialContact?.relationship || 'Colleague');
  const [notes, setNotes] = useState(initialContact?.notes || '');
  const [tags, setTags] = useState<string[]>(initialContact?.tags || ['Work']);
  const [newTagInput, setNewTagInput] = useState('');

  // Phones
  const [phones, setPhones] = useState<PhoneEntry[]>(
    initialContact?.phones || (
      initialPhoneNumber
        ? [{ id: generateId(), type: 'mobile', number: initialPhoneNumber }]
        : [{ id: generateId(), type: 'mobile', number: '' }]
    )
  );

  // Emails
  const [emails, setEmails] = useState<EmailEntry[]>(
    initialContact?.emails || [{ id: generateId(), type: 'work', email: '' }]
  );

  // Addresses
  const [addresses, setAddresses] = useState<AddressEntry[]>(
    initialContact?.addresses || []
  );

  // URLs
  const [urls, setUrls] = useState<UrlEntry[]>(
    initialContact?.urls || []
  );

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomFieldEntry[]>(
    initialContact?.customFields || []
  );

  // Add/remove handlers
  const handleAddPhone = () => {
    setPhones([...phones, { id: generateId(), type: 'mobile', number: '' }]);
  };

  const handleRemovePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
  };

  const handleUpdatePhone = (id: string, updates: Partial<PhoneEntry>) => {
    setPhones(phones.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleAddEmail = () => {
    setEmails([...emails, { id: generateId(), type: 'work', email: '' }]);
  };

  const handleRemoveEmail = (id: string) => {
    setEmails(emails.filter((e) => e.id !== id));
  };

  const handleUpdateEmail = (id: string, updates: Partial<EmailEntry>) => {
    setEmails(emails.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: generateId(),
        type: 'home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
      },
    ]);
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleUpdateAddress = (id: string, updates: Partial<AddressEntry>) => {
    setAddresses(addresses.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleAddUrl = () => {
    setUrls([...urls, { id: generateId(), label: 'Website', url: '' }]);
  };

  const handleRemoveUrl = (id: string) => {
    setUrls(urls.filter((u) => u.id !== id));
  };

  const handleUpdateUrl = (id: string, updates: Partial<UrlEntry>) => {
    setUrls(urls.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { id: generateId(), label: '', value: '' }]);
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((c) => c.id !== id));
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomFieldEntry>) => {
    setCustomFields(customFields.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim() && phones.filter(p => p.number).length === 0) {
      return;
    }

    const cleanedPhones = phones.filter((p) => p.number.trim());
    const cleanedEmails = emails.filter((e) => e.email.trim());
    const cleanedAddresses = addresses.filter((a) => a.street.trim() || a.city.trim());
    const cleanedUrls = urls.filter((u) => u.url.trim());
    const cleanedCustom = customFields.filter((c) => c.label.trim() && c.value.trim());

    const contact: Contact = {
      id: initialContact?.id || generateId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || undefined,
      avatarColor,
      avatarUrl: avatarUrl.trim() || undefined,
      company: company.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      isFavorite,
      isEmergency,
      relationship,
      birthday: birthday || undefined,
      notes: notes.trim(),
      tags,
      phones: cleanedPhones,
      emails: cleanedEmails,
      addresses: cleanedAddresses,
      urls: cleanedUrls,
      customFields: cleanedCustom,
      interactions: initialContact?.interactions || [],
      createdAt: initialContact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(contact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isEditing ? 'Edit Contact' : 'New Contact'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update contact information' : 'Add a new person to your address book'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Avatar & Quick Flags */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {firstName || lastName ? `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() : '?'}
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1">Avatar Accent</span>
                <div className="flex items-center gap-1.5">
                  {AVATAR_COLORS.slice(0, 7).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        avatarColor === color ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Favorite & Emergency flags */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  isFavorite
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                <span>Favorite</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmergency(!isEmergency)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  isEmergency
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className={`w-3.5 h-3.5 ${isEmergency ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Emergency</span>
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. JD"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Product Architect"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Phones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Phone Numbers</label>
              <button
                type="button"
                onClick={handleAddPhone}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Phone</span>
              </button>
            </div>
            {phones.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <select
                  value={p.type}
                  onChange={(e) => handleUpdatePhone(p.id, { type: e.target.value as PhoneEntry['type'] })}
                  className="w-24 text-xs p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="mobile">Mobile</option>
                  <option value="work">Work</option>
                  <option value="home">Home</option>
                  <option value="main">Main</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="tel"
                  value={p.number}
                  onChange={(e) => handleUpdatePhone(p.id, { number: e.target.value })}
                  placeholder="(555) 000-0000"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
                {phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhone(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Emails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Email Addresses</label>
              <button
                type="button"
                onClick={handleAddEmail}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Email</span>
              </button>
            </div>
            {emails.map((em) => (
              <div key={em.id} className="flex items-center gap-2">
                <select
                  value={em.type}
                  onChange={(e) => handleUpdateEmail(em.id, { type: e.target.value as EmailEntry['type'] })}
                  className="w-24 text-xs p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="email"
                  value={em.email}
                  onChange={(e) => handleUpdateEmail(em.id, { email: e.target.value })}
                  placeholder="jane.doe@example.com"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(em.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Addresses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Addresses</label>
              <button
                type="button"
                onClick={handleAddAddress}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>
            {addresses.map((addr) => (
              <div key={addr.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <select
                    value={addr.type}
                    onChange={(e) => handleUpdateAddress(addr.id, { type: e.target.value as AddressEntry['type'] })}
                    className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(addr.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={addr.street}
                  onChange={(e) => handleUpdateAddress(addr.id, { street: e.target.value })}
                  placeholder="Street address"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={addr.city}
                    onChange={(e) => handleUpdateAddress(addr.id, { city: e.target.value })}
                    placeholder="City"
                    className="col-span-2 text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={addr.state}
                    onChange={(e) => handleUpdateAddress(addr.id, { state: e.target.value })}
                    placeholder="State"
                    className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={addr.postalCode}
                    onChange={(e) => handleUpdateAddress(addr.id, { postalCode: e.target.value })}
                    placeholder="ZIP"
                    className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Birthday & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship / Group</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Colleague">Colleague</option>
                <option value="Friend">Friend</option>
                <option value="Family">Family</option>
                <option value="Client">Client</option>
                <option value="VIP">VIP</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes about background, communication preferences, context..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* URLs & Socials */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Web & Social Links</label>
              <button
                type="button"
                onClick={handleAddUrl}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>
            {urls.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={u.label}
                  onChange={(e) => handleUpdateUrl(u.id, { label: e.target.value })}
                  placeholder="Label (e.g. LinkedIn, GitHub)"
                  className="w-32 text-xs p-2 rounded-xl border border-slate-200"
                />
                <input
                  type="url"
                  value={u.url}
                  onChange={(e) => handleUpdateUrl(u.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(u.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Custom Fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Custom Fields</label>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Field</span>
              </button>
            </div>
            {customFields.map((cf) => (
              <div key={cf.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={cf.label}
                  onChange={(e) => handleUpdateCustomField(cf.id, { label: e.target.value })}
                  placeholder="Label (e.g. Pronouns, Slack)"
                  className="w-32 text-xs p-2 rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  value={cf.value}
                  onChange={(e) => handleUpdateCustomField(cf.id, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(cf.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              {isEditing ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
