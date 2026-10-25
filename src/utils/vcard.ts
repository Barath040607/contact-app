import { Contact, PhoneEntry, EmailEntry, AddressEntry } from '../types/contact';
import { generateId, getDeterministicColor } from './helpers';

export function contactToVCard(contact: Contact): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${contact.lastName};${contact.firstName};;;`,
    `FN:${contact.firstName} ${contact.lastName}`.trim(),
  ];

  if (contact.nickname) {
    lines.push(`NICKNAME:${contact.nickname}`);
  }

  if (contact.company) {
    lines.push(`ORG:${contact.company}${contact.department ? ';' + contact.department : ''}`);
  }

  if (contact.jobTitle) {
    lines.push(`TITLE:${contact.jobTitle}`);
  }

  // Phones
  for (const phone of contact.phones) {
    const type = phone.type.toUpperCase();
    lines.push(`TEL;TYPE=${type},VOICE:${phone.number}`);
  }

  // Emails
  for (const email of contact.emails) {
    const type = email.type.toUpperCase();
    lines.push(`EMAIL;TYPE=${type},INTERNET:${email.email}`);
  }

  // Addresses
  for (const addr of contact.addresses) {
    const type = addr.type.toUpperCase();
    // ADR format: post-office-box;extended-address;street;locality;region;postal-code;country
    lines.push(`ADR;TYPE=${type}:;;${addr.street};${addr.city};${addr.state};${addr.postalCode};${addr.country}`);
  }

  // URLs
  for (const u of contact.urls) {
    lines.push(`URL:${u.url}`);
  }

  // Birthday (YYYY-MM-DD)
  if (contact.birthday) {
    lines.push(`BDAY:${contact.birthday}`);
  }

  // Notes
  if (contact.notes) {
    const sanitizedNotes = contact.notes.replace(/\n/g, '\\n');
    lines.push(`NOTE:${sanitizedNotes}`);
  }

  // Categories/Tags
  if (contact.tags && contact.tags.length > 0) {
    lines.push(`CATEGORIES:${contact.tags.join(',')}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function exportContactsToVCF(contacts: Contact[]): string {
  return contacts.map(c => contactToVCard(c)).join('\r\n\r\n');
}

export function parseVCF(vcfText: string): Partial<Contact>[] {
  const cards = vcfText.split(/BEGIN:VCARD/i).filter(c => c.trim().length > 0);
  const parsedContacts: Partial<Contact>[] = [];

  for (const card of cards) {
    const lines = card.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const contact: Partial<Contact> = {
      id: generateId(),
      firstName: '',
      lastName: '',
      phones: [],
      emails: [],
      addresses: [],
      urls: [],
      tags: [],
      notes: '',
      isFavorite: false,
      isEmergency: false,
      interactions: [],
      customFields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    for (const rawLine of lines) {
      if (rawLine.startsWith('END:VCARD')) continue;

      const colonIdx = rawLine.indexOf(':');
      if (colonIdx === -1) continue;

      const meta = rawLine.substring(0, colonIdx);
      const val = rawLine.substring(colonIdx + 1).trim();

      const metaUpper = meta.toUpperCase();

      if (metaUpper.startsWith('N;') || metaUpper === 'N') {
        const parts = val.split(';');
        contact.lastName = parts[0]?.trim() || '';
        contact.firstName = parts[1]?.trim() || '';
      } else if (metaUpper.startsWith('FN;') || metaUpper === 'FN') {
        if (!contact.firstName && !contact.lastName) {
          const parts = val.split(' ');
          contact.firstName = parts[0] || '';
          contact.lastName = parts.slice(1).join(' ') || '';
        }
      } else if (metaUpper.startsWith('NICKNAME')) {
        contact.nickname = val;
      } else if (metaUpper.startsWith('ORG')) {
        const parts = val.split(';');
        contact.company = parts[0]?.trim() || '';
        if (parts[1]) contact.department = parts[1]?.trim();
      } else if (metaUpper.startsWith('TITLE')) {
        contact.jobTitle = val;
      } else if (metaUpper.startsWith('TEL')) {
        let type: PhoneEntry['type'] = 'mobile';
        if (metaUpper.includes('WORK')) type = 'work';
        else if (metaUpper.includes('HOME')) type = 'home';
        else if (metaUpper.includes('MAIN')) type = 'main';
        contact.phones!.push({ id: generateId(), type, number: val });
      } else if (metaUpper.startsWith('EMAIL')) {
        let type: EmailEntry['type'] = 'work';
        if (metaUpper.includes('HOME') || metaUpper.includes('PERSONAL')) type = 'personal';
        contact.emails!.push({ id: generateId(), type, email: val });
      } else if (metaUpper.startsWith('ADR')) {
        const parts = val.split(';');
        let type: AddressEntry['type'] = 'home';
        if (metaUpper.includes('WORK')) type = 'work';
        contact.addresses!.push({
          id: generateId(),
          type,
          street: parts[2] || '',
          city: parts[3] || '',
          state: parts[4] || '',
          postalCode: parts[5] || '',
          country: parts[6] || '',
        });
      } else if (metaUpper.startsWith('URL')) {
        contact.urls!.push({ id: generateId(), label: 'Website', url: val });
      } else if (metaUpper.startsWith('BDAY')) {
        contact.birthday = val.replace(/[^0-9-]/g, '').slice(0, 10);
      } else if (metaUpper.startsWith('NOTE')) {
        contact.notes = val.replace(/\\n/g, '\n');
      } else if (metaUpper.startsWith('CATEGORIES')) {
        contact.tags = val.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    if (contact.firstName || contact.lastName || (contact.phones && contact.phones.length > 0)) {
      contact.avatarColor = getDeterministicColor(`${contact.firstName} ${contact.lastName}`);
      parsedContacts.push(contact);
    }
  }

  return parsedContacts;
}

export function exportContactsToCSV(contacts: Contact[]): string {
  const headers = [
    'First Name',
    'Last Name',
    'Company',
    'Job Title',
    'Primary Phone',
    'Secondary Phone',
    'Primary Email',
    'Address',
    'Birthday',
    'Tags',
    'Notes'
  ];

  const escapeCSV = (str?: string) => {
    if (!str) return '""';
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = contacts.map(c => [
    escapeCSV(c.firstName),
    escapeCSV(c.lastName),
    escapeCSV(c.company),
    escapeCSV(c.jobTitle),
    escapeCSV(c.phones[0]?.number),
    escapeCSV(c.phones[1]?.number),
    escapeCSV(c.emails[0]?.email),
    escapeCSV(c.addresses[0] ? `${c.addresses[0].street}, ${c.addresses[0].city}` : ''),
    escapeCSV(c.birthday),
    escapeCSV(c.tags.join(', ')),
    escapeCSV(c.notes)
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}
