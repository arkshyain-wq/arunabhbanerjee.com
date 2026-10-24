/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiteCMSConfig, LeadItem, VisitorStats, VisitorLog } from "../types/cms";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  updateDoc,
  Firestore,
  Unsubscribe 
} from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const CMS_STORAGE_KEY = "arunabh_cms_config_v2";
const LEADS_STORAGE_KEY = "arunabh_leads_v1";
const DELETED_LEADS_KEY = "arunabh_deleted_leads_v1";
const VISITOR_STORAGE_KEY = "arunabh_visitor_stats_v1";
const VISITOR_SESSION_KEY = "arunabh_visited_session";

export const DEFAULT_CMS_CONFIG: SiteCMSConfig = {
  seo: {
    siteTitle: "Advocate Arunabh Banerjee | Supreme Court & High Court (All Courts & Tribunals)",
    metaDescription: "Official Chamber Portal of Advocate Arunabh Banerjee — Supreme Court & High Court (All Courts & Tribunals), President of CPDR India Human Rights. Specialist in Criminal Defense, Anticipatory & Regular Bail Jurisprudence, POCSO Act, Matrimonial Disputes, Corporate Litigation & Constitutional Special Leave Petitions. Chamber: 632, Lawyer's Block, Saket Courts Complex, New Delhi 110017 | Office: M-18, Ground Floor, CR Park, New Delhi - 110019 | Also at: C-81, UGF, Panchsheel Enclave, New Delhi 110017.",
    keywords: "Advocate Arunabh Banerjee, Arunabh Banerjee Supreme Court, Supreme Court & High Court, All Courts & Tribunals, Saket Courts Complex Chamber, CR Park Office, Panchsheel Enclave, Criminal Defense Lawyer Delhi, Bail Specialist Supreme Court, POCSO Defense Lawyer Delhi, CPDR India President, Matrimonial Lawyer Delhi High Court, Saket Court Advocate Arunabh Banerjee, arunabhbanerjee.com",
    canonicalDomain: "https://arunabhbanerjee.com",
    ogImage: "https://arunabhbanerjee.com/assets/images/Arunabh_Banerjee.jpeg",
    author: "Advocate Arunabh Banerjee"
  },
  theme: {
    primaryGold: "#dbb657",
    secondaryGold: "#b28d2f",
    darkBg: "#0c0d12",
    cardBg: "#12141c",
    goldGlow: "rgba(219, 182, 87, 0.15)"
  },
  contacts: {
    primaryMobile: "+919810703335",
    displayMobile: "+91 98107 03335",
    whatsappNumber: "919810703335",
    whatsappMessage: "Hello Advocate Arunabh Banerjee, I am reaching out through your official chamber portal (arunabhbanerjee.com) for legal counsel and representation.",
    chamberEmail: "chamber.arunabh.banerjee@gmail.com",
    directEmail: "prof.abanerjee@gmail.com",
    saketCourtsChamber: "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017",
    crParkOffice: "M-18, Ground Floor, CR Park, New Delhi - 110019",
    panchsheelOffice: "C-81, UGF, Panchsheel Enclave, New Delhi 110017",
    supremeCourtChamber: "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017",
    delhiHighCourtLiaison: "Delhi High Court Bar Association Chambers, Sher Shah Road, New Delhi – 110003",
    officeHours: "10:00 AM — 08:30 PM (Monday – Saturday)",
    emergencyListingNote: "24/7 Emergency listing advisory available on Sundays and judicial recess.",
    googleBusinessUrl: "https://share.google/DWN0Xox7NNa1ziBn6"
  },
  buttons: {
    callAdvocateText: "Call Advocate",
    whatsappDirectText: "WhatsApp Direct",
    bookCaseText: "Book Case",
    reserveSlotText: "Reserve Slot",
    downloadVcardText: "Save Contact (vCard)"
  },
  hero: {
    tagline: "Senior Counsel",
    titlePrefix: "Advocate",
    name: "Arunabh Banerjee",
    roleBadge: "Supreme Court Advocate",
    secondaryBadge: "Senior Counsel",
    courtLine: "Supreme Court & High Court (All Courts & Tribunals)",
    humanRightsLine: "President – C.P.D.R India Human Rights, Delhi",
    teamBadge: "Leading a Chamber Team of 12 Advocates",
    bioText: "Legal consultation and representation across criminal, matrimonial, commercial, constitutional, and human rights matters.",
    portraitUrl: "",
    yearsExperience: "15+ YEARS",
    experienceText: "Senior Advocacy Practice"
  },
  leadership: {
    sectionTitle: "Human Rights & Civil Defense",
    badge: "PRESIDENT – C.P.D.R INDIA HUMAN RIGHTS (DELHI)",
    quote: "Justice is not merely a statutory clause—it is an intrinsic human right that must be safeguarded with unwavering constitutional vigilance.",
    description: "Under Advocate Arunabh Banerjee's decisive leadership, the Council for Protection of Democratic Rights (Delhi Chapter) relentlessly protects democratic freedoms, undertrial liberties, and fair legal access across Indian trial and appellate jurisdictions."
  },
  practiceAreas: [
    {
      id: "criminal",
      title: "Criminal Defense & Bail Jurisprudence",
      description: "Exemplary trial preparation and arguments for high-stakes white-collar criminal trials, regular/anticipatory bail petitions, and complex arrest scenarios."
    },
    {
      id: "pocso",
      title: "POCSO Matters & Sensitive Criminal Litigation",
      description: "Specialized defense handles critical POCSO Act and child safety acts cases with highest degrees of confidentiality, procedural precision, and litigation wisdom."
    },
    {
      id: "matrimonial",
      title: "Matrimonial & Family Disputes",
      description: "Comprehensive resolution for contested divorce, maintenance claims, domestic violence defense (DV Act), and child custody litigations across High Courts and Family Courts."
    },
    {
      id: "commercial",
      title: "Commercial & Corporate Litigation",
      description: "Strategic contract disputes, recovery suits, arbitration hearings, corporate insolvency proceedings (NCLT/NCLAT), and injunction filings."
    },
    {
      id: "constitutional",
      title: "Constitutional & Appellate Advocacy",
      description: "Filing and arguing Special Leave Petitions (SLPs) and Writ Petitions under Article 32 & 226 before the Supreme Court and High Courts."
    },
    {
      id: "ni_act",
      title: "Section 138 Negotiable Instruments Act",
      description: "Robust cheque bounce prosecution and defense strategies, multi-crore dishonour proceedings, and appellate compounding settlements."
    },
    {
      id: "white_collar",
      title: "White-Collar & Economic Offence Matters",
      description: "Dedicated defense in investigations and proceedings before ED, CBI, SFIO, and special financial crime tribunals with thorough statutory protection."
    },
    {
      id: "human_rights",
      title: "Human Rights & Civil Liberties Litigation",
      description: "Defending fundamental freedoms, challenging illegal detentions, and custodial violence remedies guided by deep constitutional jurisprudence."
    }
  ],
  notableMatters: [
    {
      id: "matter_1",
      title: "Landmark Anticipatory Bail in Multi-State Cyber-Corporate Dispute",
      caseNo: "CRL.M.C. / High Court of Delhi",
      outcome: "Blanket protection from arrest granted upon establishing malicious prosecution and lack of statutory summons notice."
    },
    {
      id: "matter_2",
      title: "Successful Quashing of Malicious 498A & Domestic Violence Complaint",
      caseNo: "W.P.(Crl.) / Supreme Court of India",
      outcome: "Hon'ble Court quashed proceedings recognizing abuse of legal process, safeguarding client reputation."
    },
    {
      id: "matter_3",
      title: "Relief in High-Profile POCSO Trial with Evidentiary Discrepancies",
      caseNo: "Spl. POCSO Case / Sessions Court",
      outcome: "Secured complete exoneration post cross-examination exposing forensic inconsistencies and timeline impossibilities."
    },
    {
      id: "matter_4",
      title: "Emergency Habeas Corpus for Illegal Police Custody & Human Rights Restitution",
      caseNo: "Writ Petition (Civil) / Supreme Court",
      outcome: "Immediate release secured with strict judicial strictures against arbitrary detention without warrant."
    }
  ],
  chambers: [
    {
      id: "saket_chamber",
      name: "Chamber",
      badge: "COURT CHAMBER",
      address: "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017",
      landmark: "Lawyer's Block, Saket Courts Complex",
      phone: "+91 98107 03335",
      timing: "10:00 AM – 05:00 PM (Court Working Days)",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Saket+Courts+Complex+New+Delhi+110017"
    },
    {
      id: "cr_park_office",
      name: "Office",
      badge: "MAIN OFFICE",
      address: "M-18, Ground Floor, CR Park, New Delhi - 110019",
      landmark: "M-Block, Chittaranjan Park",
      phone: "+91 98107 03335",
      timing: "10:00 AM – 08:30 PM (Monday – Saturday)",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=M-18+CR+Park+New+Delhi+110019"
    },
    {
      id: "panchsheel_office",
      name: "Also at",
      badge: "ADDITIONAL OFFICE",
      address: "C-81, UGF, Panchsheel Enclave, New Delhi 110017",
      landmark: "Upper Ground Floor, Panchsheel Enclave",
      phone: "+91 98107 03335",
      timing: "By Prior Advisory Appointment",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=C-81+Panchsheel+Enclave+New+Delhi+110017"
    }
  ],
  clientCategories: [
    {
      id: "individuals",
      name: "Individuals",
      subtitle: "Personal & Criminal Defense",
      description: "Anticipatory & regular bail, matrimonial disputes, criminal defense, property litigation & fundamental rights protection."
    },
    {
      id: "corporate",
      name: "Corporate",
      subtitle: "Commercial & Business Litigation",
      description: "Contractual disputes, NCLT insolvency proceedings, commercial recovery, corporate arbitration & statutory compliance."
    },
    {
      id: "ngos",
      name: "NGOs",
      subtitle: "Civil Society & Human Rights",
      description: "Public interest litigation (PIL), fundamental freedoms, organizational governance & regulatory proceedings."
    },
    {
      id: "trusts",
      name: "Trusts",
      subtitle: "Charitable & Endowment Disputes",
      description: "Trust property administration, institutional governance, endowment compliance & appellate dispute resolution."
    },
    {
      id: "nris",
      name: "NRIs",
      subtitle: "Non-Resident Indian Counsel",
      description: "Cross-border litigation, ancestral land disputes, power of attorney litigation & High Court / Supreme Court advocacy."
    }
  ],
  firebase: {
    apiKey: "AIzaSyCCILFKE2bblpsGH6fLEJViHao2n98h7CA",
    authDomain: "meta-project-7bd88.firebaseapp.com",
    databaseURL: "https://meta-project-7bd88-default-rtdb.firebaseio.com",
    projectId: "meta-project-7bd88",
    storageBucket: "meta-project-7bd88.firebasestorage.app",
    messagingSenderId: "45731693003",
    appId: "1:45731693003:web:c3c429c733d921132fb64e",
    measurementId: "G-47211QE0E4",
    enabled: true
  }
};

type ConfigSubscriber = (config: SiteCMSConfig) => void;
type LeadsSubscriber = (leads: LeadItem[]) => void;

class CMSService {
  private config: SiteCMSConfig;
  private leads: LeadItem[] = [];
  private deletedLeadIds: Set<string> = new Set();
  private visitorStats: VisitorStats;
  private configSubscribers: ConfigSubscriber[] = [];
  private leadsSubscribers: LeadsSubscriber[] = [];
  private firebaseApp: FirebaseApp | null = null;
  private firestoreDb: Firestore | null = null;
  private analytics: Analytics | null = null;
  private firestoreConfigUnsub: Unsubscribe | null = null;
  private firestoreLeadsUnsub: Unsubscribe | null = null;
  private firestoreStatsUnsub: Unsubscribe | null = null;

  private syncEventSource: EventSource | null = null;

  constructor() {
    this.deletedLeadIds = this.loadDeletedLeadIds();
    this.config = this.loadConfig();
    this.leads = this.loadLeads();
    this.visitorStats = this.loadVisitorStats();
    this.applyTheme(this.config.theme);
    this.applySEO(this.config.seo);
    this.initFirebaseIfEnabled();
    this.initCloudLeadsSync();
  }

  // --- CONFIG MANAGEMENT ---

  public getConfig(): SiteCMSConfig {
    return { ...this.config };
  }

  public subscribeConfig(callback: ConfigSubscriber): () => void {
    this.configSubscribers.push(callback);
    callback(this.config);
    return () => {
      this.configSubscribers = this.configSubscribers.filter(cb => cb !== callback);
    };
  }

  private sanitizeProhibitedTerms<T>(obj: T): T {
    if (typeof obj === "string") {
      if ((obj as string).includes("@")) {
        return obj;
      }
      let cleaned = (obj as string)
        .replace(/sovereign\s+justice/gi, "Constitutional Justice")
        .replace(/sovereign/gi, "Constitutional")
        .replace(/professor/gi, "Advocate");
      return cleaned as unknown as T;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeProhibitedTerms(item)) as unknown as T;
    }
    if (obj !== null && typeof obj === "object") {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = this.sanitizeProhibitedTerms((obj as any)[key]);
      }
      return result as T;
    }
    return obj;
  }

  public async saveConfig(newConfig: SiteCMSConfig): Promise<boolean> {
    try {
      this.config = this.sanitizeProhibitedTerms({ ...newConfig });
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.config));
      this.applyTheme(this.config.theme);
      this.applySEO(this.config.seo);
      this.notifyConfigSubscribers();

      // Sync to Firebase if enabled
      if (this.config.firebase?.enabled && this.config.firebase.projectId) {
        await this.syncConfigToFirestore(this.config);
      }

      return true;
    } catch (err) {
      console.error("Failed to save CMS config:", err);
      return false;
    }
  }

  public resetToDefaultConfig(): SiteCMSConfig {
    this.config = this.sanitizeProhibitedTerms(JSON.parse(JSON.stringify(DEFAULT_CMS_CONFIG)));
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.config));
    this.applyTheme(this.config.theme);
    this.applySEO(this.config.seo);
    this.notifyConfigSubscribers();
    return this.config;
  }

  private loadConfig(): SiteCMSConfig {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: SiteCMSConfig = {
          ...DEFAULT_CMS_CONFIG,
          ...parsed,
          seo: { ...DEFAULT_CMS_CONFIG.seo, ...(parsed.seo || {}) },
          theme: { ...DEFAULT_CMS_CONFIG.theme, ...(parsed.theme || {}) },
          contacts: { 
            ...DEFAULT_CMS_CONFIG.contacts, 
            ...(parsed.contacts || {}),
            directEmail: parsed.contacts?.directEmail || DEFAULT_CMS_CONFIG.contacts.directEmail,
            googleBusinessUrl: parsed.contacts?.googleBusinessUrl || DEFAULT_CMS_CONFIG.contacts.googleBusinessUrl
          },
          buttons: { ...DEFAULT_CMS_CONFIG.buttons, ...(parsed.buttons || {}) },
          hero: { ...DEFAULT_CMS_CONFIG.hero, ...(parsed.hero || {}) },
          leadership: { ...DEFAULT_CMS_CONFIG.leadership, ...(parsed.leadership || {}) },
          clientCategories: parsed.clientCategories || DEFAULT_CMS_CONFIG.clientCategories,
          firebase: (parsed.firebase && parsed.firebase.apiKey && parsed.firebase.projectId)
            ? { ...DEFAULT_CMS_CONFIG.firebase, ...parsed.firebase, enabled: true }
            : DEFAULT_CMS_CONFIG.firebase
        };
        // Auto-migrate legacy stored config to reflect updated Court Coverage and Chamber/Office addresses
        if (
          !parsed.contacts?.crParkOffice ||
          parsed.hero?.courtLine === "Supreme Court of India & Delhi High Court" ||
          !parsed.chambers?.some((c: any) => c.name === "Office" || c.address?.includes("CR Park"))
        ) {
          merged.hero.courtLine = DEFAULT_CMS_CONFIG.hero.courtLine;
          merged.contacts.saketCourtsChamber = DEFAULT_CMS_CONFIG.contacts.saketCourtsChamber;
          merged.contacts.crParkOffice = DEFAULT_CMS_CONFIG.contacts.crParkOffice;
          merged.contacts.panchsheelOffice = DEFAULT_CMS_CONFIG.contacts.panchsheelOffice;
          merged.chambers = DEFAULT_CMS_CONFIG.chambers;
          merged.seo.siteTitle = DEFAULT_CMS_CONFIG.seo.siteTitle;
          merged.seo.metaDescription = DEFAULT_CMS_CONFIG.seo.metaDescription;
        }

        if (!merged.contacts.saketCourtsChamber || merged.contacts.saketCourtsChamber.startsWith("Chamber 632")) {
          merged.contacts.saketCourtsChamber = "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017";
        }

        const cleaned = this.sanitizeProhibitedTerms(merged);
        try {
          localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cleaned));
        } catch (e) {}
        return cleaned;
      }
    } catch (e) {
      console.warn("Could not parse saved config, using default", e);
    }
    return this.sanitizeProhibitedTerms(JSON.parse(JSON.stringify(DEFAULT_CMS_CONFIG)));
  }

  private notifyConfigSubscribers() {
    for (const sub of this.configSubscribers) {
      try {
        sub(this.config);
      } catch (e) {
        console.error("Error in subscriber callback", e);
      }
    }
  }

  // --- THEME & SEO INJECTION ---

  public applyTheme(theme: SiteCMSConfig["theme"]) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary-gold", theme.primaryGold);
    root.style.setProperty("--secondary-gold", theme.secondaryGold);
    root.style.setProperty("--gold-glow", theme.goldGlow);
    root.style.setProperty("--dark-bg", theme.darkBg);
    root.style.setProperty("--card-bg", theme.cardBg);
  }

  public applySEO(seo: SiteCMSConfig["seo"]) {
    if (typeof document === "undefined") return;
    
    // Title
    document.title = seo.siteTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", seo.metaDescription);

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", seo.keywords);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", seo.canonicalDomain || "https://arunabhbanerjee.com");

    // OpenGraph Tags
    this.setOrCreateMetaTag("property", "og:title", seo.siteTitle);
    this.setOrCreateMetaTag("property", "og:description", seo.metaDescription);
    this.setOrCreateMetaTag("property", "og:url", seo.canonicalDomain || "https://arunabhbanerjee.com");
    if (seo.ogImage) {
      this.setOrCreateMetaTag("property", "og:image", seo.ogImage);
    }

    // Twitter Card Tags
    this.setOrCreateMetaTag("name", "twitter:card", "summary_large_image");
    this.setOrCreateMetaTag("name", "twitter:title", seo.siteTitle);
    this.setOrCreateMetaTag("name", "twitter:description", seo.metaDescription);
    if (seo.ogImage) {
      this.setOrCreateMetaTag("name", "twitter:image", seo.ogImage);
    }
  }

  private setOrCreateMetaTag(attrName: string, attrValue: string, content: string) {
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attrName, attrValue);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  // --- LEADS / BOOKINGS MANAGEMENT ---

  public getLeads(): LeadItem[] {
    return [...this.leads];
  }

  public subscribeLeads(callback: LeadsSubscriber): () => void {
    this.leadsSubscribers.push(callback);
    callback(this.leads);
    return () => {
      this.leadsSubscribers = this.leadsSubscribers.filter(cb => cb !== callback);
    };
  }

  private readonly SYNC_TOPIC = "arunabh_chamber_leads_2026";

  private async initCloudLeadsSync() {
    if (typeof window === "undefined") return;

    // 1. Fetch recent leads from cloud pub-sub cache (since 7 days)
    try {
      const res = await fetch(`https://ntfy.sh/${this.SYNC_TOPIC}/json?poll=1&since=7d`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split("\n");
        let updated = false;

        for (const line of lines) {
          if (!line) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === "message" && parsed.message) {
              const leadObj = JSON.parse(parsed.message);
              if (leadObj && leadObj.id && !this.deletedLeadIds.has(leadObj.id) && !this.leads.some(l => l.id === leadObj.id)) {
                this.leads.unshift(leadObj);
                updated = true;
              }
            }
          } catch (e) {}
        }

        if (updated) {
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
          this.notifyLeadsSubscribers();
        }
      }
    } catch (e) {
      console.warn("Could not poll cloud leads", e);
    }

    // 2. Open live Server-Sent Events stream for real-time notifications
    try {
      if (typeof EventSource !== "undefined") {
        if (this.syncEventSource) {
          this.syncEventSource.close();
        }
        this.syncEventSource = new EventSource(`https://ntfy.sh/${this.SYNC_TOPIC}/sse`);
        this.syncEventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.event === "message" && data.message) {
              const incomingLead = JSON.parse(data.message);
              if (incomingLead && incomingLead.id && !this.deletedLeadIds.has(incomingLead.id) && !this.leads.some(l => l.id === incomingLead.id)) {
                this.leads.unshift(incomingLead);
                localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
                this.notifyLeadsSubscribers();

                // Trigger audio chime and browser notification
                this.playNotificationChime();
                this.sendBrowserNotification(
                  "⚖️ New Consultation Booking!",
                  `${incomingLead.name} (${incomingLead.phone}) • ${incomingLead.caseType}`
                );
              }
            }
          } catch (e) {}
        };
      }
    } catch (e) {
      console.warn("SSE cloud stream setup error:", e);
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    } catch (e) {
      return false;
    }
  }

  public hasNotificationPermission(): boolean {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    return Notification.permission === "granted";
  }

  public sendBrowserNotification(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.svg",
          badge: "/favicon.svg"
        });
      } catch (e) {}
    }
  }

  public playNotificationChime() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  public async addLead(leadData: Omit<LeadItem, "id" | "createdAt" | "status">): Promise<LeadItem> {
    const newLead: LeadItem = {
      ...leadData,
      id: "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      status: "new",
      createdAt: new Date().toISOString()
    };

    this.leads = [newLead, ...this.leads];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
      } catch (e) {}
    }
    this.notifyLeadsSubscribers();

    // 1. Direct real-time write to Firestore (Document ID = newLead.id)
    if (this.firestoreDb && this.config.firebase?.enabled) {
      try {
        await setDoc(doc(this.firestoreDb, "booking_leads", newLead.id), newLead);
      } catch (err) {
        console.warn("Could not sync lead to Firestore:", err);
      }
    }

    // 2. Broadcast to cloud pub-sub as secondary redundancy
    try {
      fetch(`https://ntfy.sh/${this.SYNC_TOPIC}`, {
        method: "POST",
        headers: {
          "Title": `⚖️ New Booking: ${newLead.name}`,
          "Priority": "high",
          "Tags": "briefcase,balance_scale",
          "Click": "https://arunabhbanerjee.com/admin"
        },
        body: JSON.stringify(newLead)
      }).catch(err => console.warn("ntfy broadcast error:", err));
    } catch (e) {}

    return newLead;
  }

  public async updateLeadStatus(id: string, status: LeadItem["status"], notes?: string): Promise<boolean> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return false;

    this.leads[index] = {
      ...this.leads[index],
      status,
      ...(notes !== undefined ? { notes } : {})
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
      } catch (e) {}
    }
    this.notifyLeadsSubscribers();

    // Sync status update to Firestore
    if (this.firestoreDb && this.config.firebase?.enabled) {
      try {
        await updateDoc(doc(this.firestoreDb, "booking_leads", id), {
          status,
          ...(notes !== undefined ? { notes } : {})
        });
      } catch (err) {
        console.warn("Could not update lead status in Firestore:", err);
      }
    }

    return true;
  }

  public async deleteLead(id: string): Promise<boolean> {
    this.leads = this.leads.filter(l => l.id !== id);
    this.deletedLeadIds.add(id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
        localStorage.setItem(DELETED_LEADS_KEY, JSON.stringify(Array.from(this.deletedLeadIds)));
      } catch (e) {
        console.warn("Could not save deleted leads to localStorage", e);
      }
    }
    this.notifyLeadsSubscribers();

    // Delete lead document directly from Firestore
    if (this.firestoreDb && this.config.firebase?.enabled) {
      try {
        await deleteDoc(doc(this.firestoreDb, "booking_leads", id));
      } catch (err) {
        console.warn("Could not delete lead from Firestore:", err);
      }
    }

    return true;
  }

  public async clearAllLeads(): Promise<boolean> {
    const toDelete = this.leads.map(l => l.id);
    for (const id of toDelete) {
      this.deletedLeadIds.add(id);
    }
    this.leads = [];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(DELETED_LEADS_KEY, JSON.stringify(Array.from(this.deletedLeadIds)));
      } catch (e) {}
    }
    this.notifyLeadsSubscribers();

    // Delete from Firestore
    if (this.firestoreDb && this.config.firebase?.enabled) {
      for (const id of toDelete) {
        try {
          await deleteDoc(doc(this.firestoreDb, "booking_leads", id));
        } catch (e) {}
      }
    }

    return true;
  }

  private loadDeletedLeadIds(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(DELETED_LEADS_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      }
    } catch (e) {
      console.warn("Failed to load deleted lead IDs", e);
    }
    return new Set();
  }

  public getBookedSlots(date: string): string[] {
    if (!date) return [];
    return this.leads
      .filter(l => l.date === date && l.status !== "closed" && l.timeSlot)
      .map(l => l.timeSlot as string);
  }

  public isSlotBooked(date: string, timeSlot: string): boolean {
    if (!date || !timeSlot) return false;
    return this.leads.some(
      l => l.date === date && l.timeSlot === timeSlot && l.status !== "closed"
    );
  }

  public exportLeadsCSV(): string {
    const headers = ["ID", "Name", "Client Category", "Phone", "Email", "Case Matter", "Preferred Date", "Urgent", "Status", "Date Submitted", "Message", "Notes"];
    const rows = this.leads.map(lead => [
      `"${lead.id}"`,
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.clientCategory || "Individuals"}"`,
      `"${lead.phone}"`,
      `"${lead.email || ""}"`,
      `"${lead.caseType}"`,
      `"${lead.date}"`,
      lead.isUrgent ? "Yes" : "No",
      `"${lead.status}"`,
      `"${lead.createdAt}"`,
      `"${(lead.message || "").replace(/"/g, '""')}"`,
      `"${(lead.notes || "").replace(/"/g, '""')}"`
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  private loadLeads(): LeadItem[] {
    this.deletedLeadIds = this.loadDeletedLeadIds();
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      if (stored) {
        const parsed: LeadItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(l => !this.deletedLeadIds.has(l.id));
        }
      }
    } catch (e) {
      console.warn("Failed to load leads from localStorage", e);
    }
    // Pre-populate with initial demonstration leads if empty
    const demoLeads: LeadItem[] = [
      {
        id: "demo_lead_1",
        name: "Vikramaditya Roy",
        phone: "+91 98711 23456",
        email: "v.roy.law@example.com",
        caseType: "Criminal Defense & Bail",
        date: "2026-10-24",
        message: "Urgent bail application pending before Hon'ble High Court of Delhi. Needs senior counsel representation.",
        isUrgent: true,
        status: "new",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        notes: "Client contacted via WhatsApp. Documents received."
      },
      {
        id: "demo_lead_2",
        name: "Smt. Priyanka Sharma",
        phone: "+91 98112 98765",
        email: "priyanka.sharma@example.com",
        caseType: "Matrimonial & Child Custody",
        date: "2026-10-26",
        message: "Seeking urgent consultation for custody dispute and maintenance proceeding in Saket Family Court.",
        isUrgent: false,
        status: "contacted",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
    const filteredDemo = demoLeads.filter(l => !this.deletedLeadIds.has(l.id));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(filteredDemo));
      } catch (e) {}
    }
    return filteredDemo;
  }

  private notifyLeadsSubscribers() {
    for (const sub of this.leadsSubscribers) {
      try {
        sub(this.leads);
      } catch (e) {
        console.error("Error in lead subscriber callback", e);
      }
    }
  }

  // --- VISITOR TRACKING & ANALYTICS ---

  public trackVisit(pagePath = "/"): VisitorStats {
    try {
      const isNewSession = !sessionStorage.getItem(VISITOR_SESSION_KEY);
      sessionStorage.setItem(VISITOR_SESSION_KEY, "true");

      const log: VisitorLog = {
        id: "v_" + Date.now(),
        timestamp: new Date().toISOString(),
        page: pagePath,
        referrer: typeof document !== "undefined" ? document.referrer || "Direct" : "Direct",
        device: typeof navigator !== "undefined" 
          ? (/Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop") 
          : "Unknown"
      };

      this.visitorStats = {
        totalVisits: (this.visitorStats.totalVisits || 0) + 1,
        uniqueVisitors: (this.visitorStats.uniqueVisitors || 0) + (isNewSession ? 1 : 0),
        lastVisit: new Date().toISOString(),
        recentLogs: [log, ...(this.visitorStats.recentLogs || []).slice(0, 49)]
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
        } catch (e) {}
      }

      // Sync stats to Firestore
      if (this.firestoreDb && this.config.firebase?.enabled) {
        setDoc(doc(this.firestoreDb, "analytics", "visitor_stats"), this.visitorStats, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn("Could not record visitor tracking", e);
    }
    return this.visitorStats;
  }

  public trackClick(type: "call" | "whatsapp" | "booking" | "maps" | "email"): VisitorStats {
    try {
      const currentClicks = this.visitorStats.clicks || {
        callClicks: 142,
        whatsappClicks: 198,
        bookingClicks: 47,
        mapsClicks: 86
      };

      if (type === "call") currentClicks.callClicks += 1;
      if (type === "whatsapp") currentClicks.whatsappClicks += 1;
      if (type === "booking") currentClicks.bookingClicks += 1;
      if (type === "maps") currentClicks.mapsClicks += 1;
      if (type === "email") currentClicks.emailClicks = (currentClicks.emailClicks || 0) + 1;

      this.visitorStats = {
        ...this.visitorStats,
        clicks: currentClicks
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
        } catch (e) {}
      }

      // Sync stats to Firestore
      if (this.firestoreDb && this.config.firebase?.enabled) {
        setDoc(doc(this.firestoreDb, "analytics", "visitor_stats"), this.visitorStats, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn("Could not record click tracking", e);
    }
    return this.visitorStats;
  }

  public getVisitorStats(): VisitorStats {
    return { ...this.visitorStats };
  }

  public setVisitorCount(total: number, unique: number): VisitorStats {
    this.visitorStats = {
      ...this.visitorStats,
      totalVisits: total,
      uniqueVisitors: unique
    };
    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
    return this.visitorStats;
  }

  private loadVisitorStats(): VisitorStats {
    try {
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.clicks) {
          parsed.clicks = {
            callClicks: 142,
            whatsappClicks: 198,
            bookingClicks: 47,
            mapsClicks: 86
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load visitor stats", e);
    }
    return {
      totalVisits: 1420,
      uniqueVisitors: 894,
      lastVisit: new Date().toISOString(),
      clicks: {
        callClicks: 142,
        whatsappClicks: 198,
        bookingClicks: 47,
        mapsClicks: 86
      },
      recentLogs: []
    };
  }

  // --- FIREBASE REAL-TIME SYNC INTEGRATION ---

  public async initFirebaseIfEnabled(): Promise<{ success: boolean; message: string }> {
    const fb = this.config.firebase;
    if (!fb || !fb.enabled || !fb.apiKey || !fb.projectId) {
      return { success: false, message: "Firebase is currently disabled or missing config." };
    }

    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.firebaseApp = existingApps[0];
      } else {
        this.firebaseApp = initializeApp({
          apiKey: fb.apiKey,
          authDomain: fb.authDomain,
          databaseURL: fb.databaseURL,
          projectId: fb.projectId,
          storageBucket: fb.storageBucket,
          messagingSenderId: fb.messagingSenderId,
          appId: fb.appId,
          measurementId: fb.measurementId
        });
      }

      // Initialize Firebase Google Analytics if supported
      if (typeof window !== "undefined" && fb.measurementId) {
        isSupported().then(supported => {
          if (supported && this.firebaseApp) {
            this.analytics = getAnalytics(this.firebaseApp);
          }
        }).catch(() => {});
      }

      this.firestoreDb = getFirestore(this.firebaseApp);

      // 1. Real-time sync for Site Configuration (Index & Admin synced live)
      this.setupFirestoreConfigSync();

      // 2. Real-time sync for Consultation Booking Leads
      this.setupFirestoreLeadsSync();

      // 3. Real-time sync for Visitor & Click Analytics
      this.setupFirestoreStatsSync();

      return { success: true, message: `Connected to Firebase project: ${fb.projectId}` };
    } catch (err: any) {
      console.error("Firebase connection error:", err);
      return { success: false, message: `Firebase Error: ${err.message || String(err)}` };
    }
  }

  private setupFirestoreConfigSync() {
    if (!this.firestoreDb) return;
    if (this.firestoreConfigUnsub) {
      this.firestoreConfigUnsub();
      this.firestoreConfigUnsub = null;
    }

    const configDocRef = doc(this.firestoreDb, "site_settings", "cms_config");

    this.firestoreConfigUnsub = onSnapshot(configDocRef, (snap) => {
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<SiteCMSConfig>;
        if (remoteData) {
          const currentFirebase = this.config.firebase;
          const merged: SiteCMSConfig = {
            ...this.config,
            ...remoteData,
            contacts: {
              ...this.config.contacts,
              ...(remoteData.contacts || {}),
              saketCourtsChamber: "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017",
              crParkOffice: remoteData.contacts?.crParkOffice || "M-18, Ground Floor, CR Park, New Delhi - 110019",
              panchsheelOffice: remoteData.contacts?.panchsheelOffice || "C-81, UGF, Panchsheel Enclave, New Delhi 110017"
            },
            hero: {
              ...this.config.hero,
              ...(remoteData.hero || {}),
              courtLine: (!remoteData.hero?.courtLine || remoteData.hero.courtLine.includes("Delhi High Court"))
                ? "Supreme Court & High Court (All Courts & Tribunals)"
                : remoteData.hero.courtLine
            },
            chambers: DEFAULT_CMS_CONFIG.chambers,
            firebase: {
              ...currentFirebase,
              ...(remoteData.firebase || {}),
              enabled: true
            }
          };

          const needsRemoteUpdate = 
            remoteData.contacts?.saketCourtsChamber !== "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017" ||
            !remoteData.contacts?.crParkOffice ||
            !remoteData.contacts?.panchsheelOffice;

          this.config = this.sanitizeProhibitedTerms(merged);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.config));
            } catch (e) {}
          }
          this.applyTheme(this.config.theme);
          this.applySEO(this.config.seo);
          this.notifyConfigSubscribers();

          if (needsRemoteUpdate) {
            this.syncConfigToFirestore(this.config);
          }
        }
      } else {
        // Seed remote doc with current active configuration
        this.syncConfigToFirestore(this.config);
      }
    }, (err) => {
      console.warn("Firestore config snapshot error:", err);
    });
  }

  private setupFirestoreLeadsSync() {
    if (!this.firestoreDb) return;
    if (this.firestoreLeadsUnsub) {
      this.firestoreLeadsUnsub();
      this.firestoreLeadsUnsub = null;
    }

    const leadsCollection = collection(this.firestoreDb, "booking_leads");

    this.firestoreLeadsUnsub = onSnapshot(leadsCollection, (snapshot) => {
      const incomingLeads: LeadItem[] = [];
      snapshot.forEach(docSnap => {
        const item = docSnap.data() as LeadItem;
        if (item && item.id && !this.deletedLeadIds.has(item.id)) {
          incomingLeads.push(item);
        }
      });

      // Sort by creation date descending
      incomingLeads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      const isInitial = this.leads.length === 0;
      const brandNew = incomingLeads.filter(nl => !this.leads.some(l => l.id === nl.id));

      if (incomingLeads.length > 0 || this.leads.length > 0) {
        this.leads = incomingLeads;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
          } catch (e) {}
        }
        this.notifyLeadsSubscribers();

        // Trigger real-time sound chime and push notification for newly booked leads
        if (!isInitial && brandNew.length > 0) {
          this.playNotificationChime();
          const first = brandNew[0];
          this.sendBrowserNotification(
            `⚖️ New Booking: ${first.name}`,
            `${first.caseType} • ${first.phone}`
          );
        }
      }
    }, (err) => {
      console.warn("Firestore leads snapshot error:", err);
    });
  }

  private setupFirestoreStatsSync() {
    if (!this.firestoreDb) return;
    if (this.firestoreStatsUnsub) {
      this.firestoreStatsUnsub();
      this.firestoreStatsUnsub = null;
    }

    const statsDocRef = doc(this.firestoreDb, "analytics", "visitor_stats");

    this.firestoreStatsUnsub = onSnapshot(statsDocRef, (snap) => {
      if (snap.exists()) {
        const remoteStats = snap.data() as Partial<VisitorStats>;
        if (remoteStats) {
          this.visitorStats = {
            totalVisits: Math.max(this.visitorStats.totalVisits, remoteStats.totalVisits || 0),
            uniqueVisitors: Math.max(this.visitorStats.uniqueVisitors, remoteStats.uniqueVisitors || 0),
            lastVisit: remoteStats.lastVisit || this.visitorStats.lastVisit,
            clicks: {
              callClicks: Math.max(this.visitorStats.clicks?.callClicks || 0, remoteStats.clicks?.callClicks || 0),
              whatsappClicks: Math.max(this.visitorStats.clicks?.whatsappClicks || 0, remoteStats.clicks?.whatsappClicks || 0),
              emailClicks: Math.max(this.visitorStats.clicks?.emailClicks || 0, remoteStats.clicks?.emailClicks || 0),
              bookingClicks: Math.max(this.visitorStats.clicks?.bookingClicks || 0, remoteStats.clicks?.bookingClicks || 0),
              mapsClicks: Math.max(this.visitorStats.clicks?.mapsClicks || 0, remoteStats.clicks?.mapsClicks || 0)
            },
            recentLogs: remoteStats.recentLogs && remoteStats.recentLogs.length > 0 
              ? remoteStats.recentLogs 
              : this.visitorStats.recentLogs
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
            } catch (e) {}
          }
        }
      }
    }, (err) => {
      console.warn("Firestore stats snapshot error:", err);
    });
  }

  private async syncConfigToFirestore(config: SiteCMSConfig) {
    if (!this.firestoreDb) return;
    try {
      const cleanConfig = { ...config };
      await setDoc(doc(this.firestoreDb, "site_settings", "cms_config"), cleanConfig, { merge: true });
    } catch (err) {
      console.warn("Could not sync config to Firestore:", err);
    }
  }
}

export const cmsService = new CMSService();
