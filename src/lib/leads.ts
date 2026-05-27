type LeadPayload = {
  nome: string;
  whatsapp: string;
  empresa: string;
  objetivo: string;
};

export type Lead = {
  id: string;
  created_at: string;
  nome: string;
  whatsapp: string;
  empresa?: string;
  objetivo?: string;
  source?: string;
};

type SaveLeadResult = { status: "saved" } | { status: "skipped"; reason: "browser-only" };

const STORAGE_KEY = "voc-landing-leads";

function cleanText(value: string): string {
  return value.trim().slice(0, 1000);
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredLeads(): Lead[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const leads = JSON.parse(raw);
    return Array.isArray(leads) ? leads : [];
  } catch {
    return [];
  }
}

function writeStoredLeads(leads: Lead[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export async function saveLead(payload: LeadPayload): Promise<SaveLeadResult> {
  if (!canUseStorage()) {
    return { status: "skipped", reason: "browser-only" };
  }

  const lead: Lead = {
    id: window.crypto?.randomUUID?.() ?? `${Date.now()}`,
    created_at: new Date().toISOString(),
    nome: cleanText(payload.nome),
    whatsapp: cleanText(payload.whatsapp),
    empresa: cleanText(payload.empresa),
    objetivo: cleanText(payload.objetivo),
    source: "landing-page-voc",
  };

  writeStoredLeads([lead, ...readStoredLeads()]);
  return { status: "saved" };
}

export async function listAdminLeads(): Promise<Lead[]> {
  return readStoredLeads();
}

export async function clearAdminLeads(): Promise<void> {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
