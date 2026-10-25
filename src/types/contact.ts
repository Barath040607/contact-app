export type PhoneType = 'mobile' | 'work' | 'home' | 'main' | 'other';
export type EmailType = 'work' | 'personal' | 'other';
export type AddressType = 'home' | 'work' | 'other';
export type InteractionType = 'call' | 'email' | 'message' | 'meeting' | 'note';

export interface PhoneEntry {
  id: string;
  type: PhoneType;
  number: string;
}

export interface EmailEntry {
  id: string;
  type: EmailType;
  email: string;
}

export interface AddressEntry {
  id: string;
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UrlEntry {
  id: string;
  label: string;
  url: string;
}

export interface CustomFieldEntry {
  id: string;
  label: string;
  value: string;
}

export interface InteractionEntry {
  id: string;
  timestamp: string;
  type: InteractionType;
  summary: string;
  duration?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarUrl?: string;
  avatarColor: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  isFavorite: boolean;
  isEmergency: boolean;
  phones: PhoneEntry[];
  emails: EmailEntry[];
  addresses: AddressEntry[];
  urls: UrlEntry[];
  birthday?: string; // YYYY-MM-DD
  relationship?: 'Colleague' | 'Family' | 'Friend' | 'Client' | 'VIP' | 'Partner' | string;
  tags: string[];
  notes: string;
  interactions: InteractionEntry[];
  customFields: CustomFieldEntry[];
  createdAt: string;
  updatedAt: string;
}

export type ViewFilter = 
  | { type: 'all' }
  | { type: 'favorites' }
  | { type: 'emergency' }
  | { type: 'tag'; tag: string }
  | { type: 'company'; company: string };

export type SortOption = 'first-name-asc' | 'last-name-asc' | 'recently-added' | 'recently-updated';
