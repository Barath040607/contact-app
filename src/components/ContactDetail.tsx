import React, { useState } from 'react';
import { Contact } from '../types/contact';
import {
  formatFullName,
  formatPhoneNumber,
  getInitials,
  calculateBirthdayInfo,
} from '../utils/helpers';
import {
  Phone,
  Mail,
  MessageSquare,
  QrCode,
  Edit3,
  Trash2,
  Star,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Cake,
  Calendar,
  Clock,
  PlusCircle,
  Copy,
  Check,
  ChevronLeft,
  Briefcase,
  Users,
} from 'lucide-react';

interface ContactDetailProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onToggleFavorite: (contactId: string) => void;
  onOpenQR: (contact: Contact) => void;
  onOpenDialer: (phoneNumber?: string) => void;
  onOpenLogInteraction: (contact: Contact) => void;
  onBackMobile?: () => void;
}

export const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenQR,
  onOpenDialer,
  onOpenLogInteraction,
  onBackMobile,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fullName = formatFullName(contact);
  const bdayInfo = calculateBirthdayInfo(contact.birthday);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const primaryPhone = contact.phones[0]?.number;
  const primaryEmail = contact.emails[0]?.email;

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Top Mobile Bar */}
      {onBackMobile && (
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={onBackMobile}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Contacts</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(contact.id)}
              className="p-1.5 text-slate-400 hover:text-amber-500"
            >
              <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={() => onOpenQR(contact)}
              className="p-1.5 text-slate-400 hover:text-slate-700"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Dossier Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: contact.avatarColor }}
            >
              {getInitials(contact.firstName, contact.lastName)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                {contact.nickname && (
                  <span className="text-xs font-normal text-slate-400">"{contact.nickname}"</span>
                )}
                <button
                  onClick={() => onToggleFavorite(contact.id)}
                  className="p-1 text-slate-300 hover:text-amber-500 transition-colors ml-1"
                  title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      contact.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Subtitles: Company & Title */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                {contact.jobTitle && <span>{contact.jobTitle}</span>}
                {contact.jobTitle && contact.company && <span aria-hidden="true">·</span>}
                {contact.company && <span className="font-medium text-slate-700">{contact.company}</span>}
                {contact.department && <span className="text-slate-400">({contact.department})</span>}
              </div>

              {/* Relationship & Emergency */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                {contact.relationship && (
                  <span className="font-medium text-slate-600">{contact.relationship}</span>
                )}
                {contact.relationship && contact.isEmergency && <span aria-hidden="true">·</span>}
                {contact.isEmergency && (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Emergency Contact</span>
                  </span>
                )}
                {contact.tags.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{contact.tags.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Top Quick Actions (Edit, Delete, QR) */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => onOpenQR(contact)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Share contact card via QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Share Card</span>
            </button>

            <button
              onClick={() => onEdit(contact)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Edit contact"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                <button
                  onClick={() => onDelete(contact.id)}
                  className="py-1 px-2.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-1 px-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Action Ribbon */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-slate-100">
          {/* Call */}
          <button
            onClick={() => {
              if (primaryPhone) {
                onOpenDialer(primaryPhone);
              } else {
                onOpenDialer();
              }
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">Call</span>
          </button>

          {/* Message / SMS */}
          <a
            href={primaryPhone ? `sms:${primaryPhone.replace(/\D/g, '')}` : '#'}
            onClick={(e) => {
              if (!primaryPhone) {
                e.preventDefault();
              }
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs group ${
              !primaryPhone ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">Message</span>
          </a>

          {/* Email */}
          <a
            href={primaryEmail ? `mailto:${primaryEmail}` : '#'}
            onClick={(e) => {
              if (!primaryEmail) {
                e.preventDefault();
              }
            }}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs group ${
              !primaryEmail ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">Email</span>
          </a>

          {/* Log Touchpoint */}
          <button
            onClick={() => onOpenLogInteraction(contact)}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">Log Activity</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Contact Coordinates: Phones & Emails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phones Box */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Phone Numbers
            </h3>
            {contact.phones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No phone numbers listed</p>
            ) : (
              <div className="space-y-3">
                {contact.phones.map((phone) => (
                  <div key={phone.id} className="flex items-center justify-between group">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        {phone.type}
                      </span>
                      <a
                        href={`tel:${phone.number.replace(/\D/g, '')}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 font-mono"
                      >
                        {formatPhoneNumber(phone.number)}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(phone.number, phone.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Copy number"
                      >
                        {copiedId === phone.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onOpenDialer(phone.number)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Dial number"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emails Box */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Email Addresses
            </h3>
            {contact.emails.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No email addresses listed</p>
            ) : (
              <div className="space-y-3">
                {contact.emails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between group">
                    <div className="overflow-hidden pr-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        {email.type}
                      </span>
                      <a
                        href={`mailto:${email.email}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {email.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(email.email, email.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Copy email"
                      >
                        {copiedId === email.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`mailto:${email.email}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Compose email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Addresses & Birthday */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Addresses */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Physical Addresses
            </h3>
            {contact.addresses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No address listed</p>
            ) : (
              <div className="space-y-3">
                {contact.addresses.map((addr) => {
                  const fullAddress = `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    fullAddress
                  )}`;
                  return (
                    <div key={addr.id} className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="text-xs leading-relaxed text-slate-700">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                            {addr.type}
                          </span>
                          <p>{addr.street}</p>
                          <p>
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-slate-400">{addr.country}</p>
                        </div>
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Open in Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Birthday & Key Dates */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Dates & Milestones
            </h3>
            {bdayInfo ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    {bdayInfo.formattedDate}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    {bdayInfo.age && <span>{bdayInfo.age} years old</span>}
                    {bdayInfo.age && <span aria-hidden="true">·</span>}
                    {bdayInfo.isToday ? (
                      <span className="text-pink-600 font-semibold">Birthday Today! 🎉</span>
                    ) : (
                      <span>in {bdayInfo.daysUntil} days</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No birthday recorded</p>
            )}

            {/* Added & Updated Timestamps */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Added</span>
                <span className="font-mono">
                  {new Date(contact.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Updated</span>
                <span className="font-mono">
                  {new Date(contact.updatedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* URLs & Social profiles */}
        {contact.urls.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Web & Profiles
            </h3>
            <div className="flex flex-wrap gap-2">
              {contact.urls.map((u) => (
                <a
                  key={u.id}
                  href={u.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  <span>{u.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {contact.customFields.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Additional Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {contact.customFields.map((cf) => (
                <div key={cf.id} className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    {cf.label}
                  </span>
                  <span className="text-xs font-medium text-slate-800">{cf.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Notes
            </h3>
            <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
              {contact.notes}
            </div>
          </div>
        )}

        {/* Activity & Interaction History */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Touchpoints & Interaction History ({contact.interactions.length})
              </h3>
            </div>
            <button
              onClick={() => onOpenLogInteraction(contact)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
          </div>

          {contact.interactions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400">No calls, emails, or meetings logged yet.</p>
              <button
                onClick={() => onOpenLogInteraction(contact)}
                className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
              >
                Record your first touchpoint
              </button>
            </div>
          ) : (
            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {contact.interactions.map((item) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (item.type === 'call') badgeColor = 'bg-emerald-100 text-emerald-800';
                if (item.type === 'meeting') badgeColor = 'bg-purple-100 text-purple-800';
                if (item.type === 'email') badgeColor = 'bg-indigo-100 text-indigo-800';
                if (item.type === 'message') badgeColor = 'bg-sky-100 text-sky-800';

                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-400 group-hover:border-indigo-600 transition-colors" />

                    <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm ${badgeColor}`}
                          >
                            {item.type}
                          </span>
                          {item.duration && (
                            <span className="text-[11px] font-mono text-slate-400">
                              ({item.duration})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                          {new Date(item.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.summary}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
