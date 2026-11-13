import { create } from "zustand";
import type { Severity } from "./data";

type SeverityFilter = "all" | Severity;
type LangFilter = "all" | "HCL" | "YAML" | "Python" | "Bash";

type ConsoleState = {
  query: string;
  setQuery: (query: string) => void;
  banner: boolean;
  dismissBanner: () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  phase: number;
  setPhase: (phase: number) => void;
  customerId: string;
  setCustomerId: (id: string) => void;
  migrationId: string;
  setMigrationId: (id: string) => void;
  findingId: string;
  setFindingId: (id: string) => void;
  docPath: string;
  setDocPath: (path: string) => void;
  workflow: string;
  setWorkflow: (name: string) => void;
  hostName: string;
  setHostName: (name: string) => void;
  alertId: string;
  setAlertId: (id: string) => void;
  severity: SeverityFilter;
  setSeverity: (severity: SeverityFilter) => void;
  lang: LangFilter;
  setLang: (lang: LangFilter) => void;
  acks: Record<string, true>;
  acknowledge: (id: string) => void;
};

export const useConsole = create<ConsoleState>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
  banner: true,
  dismissBanner: () => set({ banner: false }),
  navOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  phase: 1,
  setPhase: (phase) => set({ phase }),
  customerId: "customer-a",
  setCustomerId: (customerId) => set({ customerId }),
  migrationId: "mig-customer-b",
  setMigrationId: (migrationId) => set({ migrationId }),
  findingId: "CB-C-001",
  setFindingId: (findingId) => set({ findingId }),
  docPath: "docs/architecture/overview.md",
  setDocPath: (docPath) => set({ docPath }),
  workflow: "ci.yml",
  setWorkflow: (workflow) => set({ workflow }),
  hostName: "customer-a-appserver",
  setHostName: (hostName) => set({ hostName }),
  alertId: "ALERT-001",
  setAlertId: (alertId) => set({ alertId }),
  severity: "all",
  setSeverity: (severity) => set({ severity }),
  lang: "all",
  setLang: (lang) => set({ lang }),
  acks: {},
  acknowledge: (id) => set((state) => ({ acks: { ...state.acks, [id]: true } })),
}));
