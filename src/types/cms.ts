/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PracticeAreaItem {
  id: string;
  title: string;
  description: string;
}

export interface NotableMatterItem {
  id: string;
  title: string;
  caseNo: string;
  outcome: string;
}

export interface ChamberItem {
  id: string;
  name: string;
  address: string;
  landmark?: string;
  phone: string;
  timing: string;
}

export interface ClientCategoryItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
}

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  clientCategory?: 'Individuals' | 'Corporate' | 'NGOs' | 'Trusts' | 'NRIs' | string;
  caseType: string;
  date: string;
  timeSlot?: string;
  message?: string;
  isUrgent?: boolean;
  status: 'new' | 'contacted' | 'consultation_scheduled' | 'closed';
  createdAt: string;
  notes?: string;
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  page: string;
  referrer: string;
  device: string;
}

export interface ClickStats {
  callClicks: number;
  whatsappClicks: number;
  bookingClicks: number;
  mapsClicks: number;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  lastVisit: string;
  clicks?: ClickStats;
  recentLogs: VisitorLog[];
}

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  enabled: boolean;
}

export interface SiteCMSConfig {
  seo: {
    siteTitle: string;
    metaDescription: string;
    keywords: string;
    canonicalDomain: string;
    ogImage: string;
    author: string;
  };
  theme: {
    primaryGold: string;
    secondaryGold: string;
    darkBg: string;
    cardBg: string;
    goldGlow: string;
  };
  contacts: {
    primaryMobile: string;
    displayMobile: string;
    whatsappNumber: string;
    whatsappMessage: string;
    chamberEmail: string;
    directEmail?: string;
    supremeCourtChamber: string;
    saketCourtsChamber: string;
    delhiHighCourtLiaison: string;
    officeHours: string;
    emergencyListingNote: string;
    googleBusinessUrl?: string;
  };
  buttons: {
    callAdvocateText: string;
    whatsappDirectText: string;
    bookCaseText: string;
    reserveSlotText: string;
    downloadVcardText: string;
  };
  hero: {
    tagline: string;
    titlePrefix: string;
    name: string;
    roleBadge: string;
    secondaryBadge: string;
    courtLine: string;
    humanRightsLine: string;
    teamBadge?: string;
    bioText: string;
    portraitUrl: string;
    yearsExperience: string;
    experienceText: string;
  };
  leadership: {
    sectionTitle: string;
    badge: string;
    quote: string;
    description: string;
  };
  practiceAreas: PracticeAreaItem[];
  notableMatters: NotableMatterItem[];
  chambers: ChamberItem[];
  clientCategories?: ClientCategoryItem[];
  firebase: FirebaseCredentials;
}
