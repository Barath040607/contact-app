import { Contact } from '../types/contact';

export const AVATAR_COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#DB2777', // Pink
  '#475569', // Slate
  '#0D9488', // Teal
];

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  if (!f && !l) return '?';
  return `${f}${l}`;
}

export function getDeterministicColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function formatFullName(contact: Partial<Contact>): string {
  const first = contact.firstName?.trim() || '';
  const last = contact.lastName?.trim() || '';
  if (!first && !last) return 'Unnamed Contact';
  return `${first} ${last}`.trim();
}

export function formatPhoneNumber(num: string): string {
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return num;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export interface BirthdayInfo {
  age?: number;
  daysUntil: number;
  isToday: boolean;
  formattedDate: string;
}

export function calculateBirthdayInfo(birthdayStr?: string): BirthdayInfo | null {
  if (!birthdayStr) return null;
  const parts = birthdayStr.split('-');
  if (parts.length < 3) return null;
  
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
  const birthDay = parseInt(parts[2], 10);

  const today = new Date();
  const currentYear = today.getFullYear();

  let nextBday = new Date(currentYear, birthMonth, birthDay);
  // Reset time to start of day for comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (nextBday < todayStart) {
    nextBday = new Date(currentYear + 1, birthMonth, birthDay);
  }

  const diffTime = nextBday.getTime() - todayStart.getTime();
  const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const isToday = daysUntil === 0;

  let age: number | undefined;
  if (!isNaN(birthYear) && birthYear > 1900 && birthYear <= currentYear) {
    age = currentYear - birthYear;
    const hasHadBirthdayThisYear = 
      today.getMonth() > birthMonth || 
      (today.getMonth() === birthMonth && today.getDate() >= birthDay);
    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    age,
    daysUntil,
    isToday,
    formattedDate: `${monthNames[birthMonth]} ${birthDay}${age ? `, ${birthYear}` : ''}`,
  };
}

export interface DuplicateGroup {
  reason: string;
  contacts: Contact[];
}

export function findDuplicates(contacts: Contact[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const visited = new Set<string>();

  // Check email duplicates
  const emailMap = new Map<string, Contact[]>();
  for (const c of contacts) {
    for (const em of c.emails) {
      const email = em.email.trim().toLowerCase();
      if (email) {
        if (!emailMap.has(email)) emailMap.set(email, []);
        emailMap.get(email)!.push(c);
      }
    }
  }
  for (const [email, list] of emailMap.entries()) {
    if (list.length > 1) {
      const pairKey = list.map(c => c.id).sort().join('-');
      if (!visited.has(pairKey)) {
        visited.add(pairKey);
        groups.push({
          reason: `Matching email: ${email}`,
          contacts: list,
        });
      }
    }
  }

  // Check phone duplicates
  const phoneMap = new Map<string, Contact[]>();
  for (const c of contacts) {
    for (const ph of c.phones) {
      const num = ph.number.replace(/\D/g, '');
      if (num.length >= 7) {
        if (!phoneMap.has(num)) phoneMap.set(num, []);
        phoneMap.get(num)!.push(c);
      }
    }
  }
  for (const [num, list] of phoneMap.entries()) {
    if (list.length > 1) {
      const pairKey = list.map(c => c.id).sort().join('-');
      if (!visited.has(pairKey)) {
        visited.add(pairKey);
        groups.push({
          reason: `Matching phone: ${formatPhoneNumber(num)}`,
          contacts: list,
        });
      }
    }
  }

  // Check exact name duplicates
  const nameMap = new Map<string, Contact[]>();
  for (const c of contacts) {
    const name = `${c.firstName.trim().toLowerCase()} ${c.lastName.trim().toLowerCase()}`.trim();
    if (name) {
      if (!nameMap.has(name)) nameMap.set(name, []);
      nameMap.get(name)!.push(c);
    }
  }
  for (const [, list] of nameMap.entries()) {
    if (list.length > 1) {
      const pairKey = list.map(c => c.id).sort().join('-');
      if (!visited.has(pairKey)) {
        visited.add(pairKey);
        groups.push({
          reason: `Identical name: ${formatFullName(list[0])}`,
          contacts: list,
        });
      }
    }
  }

  return groups;
}

export function mergeContacts(primary: Contact, secondary: Contact): Contact {
  const merged: Contact = {
    ...primary,
    nickname: primary.nickname || secondary.nickname,
    avatarUrl: primary.avatarUrl || secondary.avatarUrl,
    company: primary.company || secondary.company,
    jobTitle: primary.jobTitle || secondary.jobTitle,
    department: primary.department || secondary.department,
    isFavorite: primary.isFavorite || secondary.isFavorite,
    isEmergency: primary.isEmergency || secondary.isEmergency,
    birthday: primary.birthday || secondary.birthday,
    relationship: primary.relationship || secondary.relationship,
    notes: [primary.notes, secondary.notes].filter(Boolean).join('\n\n--- Merged Notes ---\n'),
    updatedAt: new Date().toISOString(),
    
    // Merge phones without duplicating number
    phones: [...primary.phones],
    emails: [...primary.emails],
    addresses: [...primary.addresses],
    urls: [...primary.urls],
    tags: Array.from(new Set([...primary.tags, ...secondary.tags])),
    interactions: [...primary.interactions, ...secondary.interactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    customFields: [...primary.customFields],
  };

  // Add unique phones from secondary
  for (const sp of secondary.phones) {
    const sClean = sp.number.replace(/\D/g, '');
    const exists = merged.phones.some(p => p.number.replace(/\D/g, '') === sClean);
    if (!exists) {
      merged.phones.push({ ...sp, id: generateId() });
    }
  }

  // Add unique emails from secondary
  for (const se of secondary.emails) {
    const exists = merged.emails.some(e => e.email.trim().toLowerCase() === se.email.trim().toLowerCase());
    if (!exists) {
      merged.emails.push({ ...se, id: generateId() });
    }
  }

  // Add unique addresses
  for (const sa of secondary.addresses) {
    const exists = merged.addresses.some(a => a.street === sa.street && a.city === sa.city);
    if (!exists) {
      merged.addresses.push({ ...sa, id: generateId() });
    }
  }

  // Add unique urls
  for (const su of secondary.urls) {
    const exists = merged.urls.some(u => u.url === su.url);
    if (!exists) {
      merged.urls.push({ ...su, id: generateId() });
    }
  }

  // Add unique custom fields
  for (const sc of secondary.customFields) {
    const exists = merged.customFields.some(c => c.label.toLowerCase() === sc.label.toLowerCase());
    if (!exists) {
      merged.customFields.push({ ...sc, id: generateId() });
    }
  }

  return merged;
}
