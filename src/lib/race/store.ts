import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CSS_PREFILL,
  EMPTY_BRIEF,
  OMER_PREFILL,
  type Brief,
  type CitationState,
  type DeskView,
  type Disposition,
  type DrillPhase,
  type Rank,
  type RoleId,
} from "./data";

export type FiledBrief = {
  id: string;
  role: RoleId;
  brief: Brief;
  line: string;
  missing: string[];
  filedAt: string;
};

type DeskState = {
  view: DeskView;
  recipeId: string;
  selectedRole: RoleId;
  briefRole: RoleId;
  brief: Brief;
  phase: DrillPhase;
  marks1: Record<string, CitationState | "">;
  disposition1: Disposition | "";
  note1: string;
  marks2: Record<string, CitationState | "">;
  disposition2: Disposition | "";
  note2: string;
  piAck: boolean;
  hypothesisLocked: boolean;
  afrRank: Rank | "";
  afrNote: string;
  assignments: FiledBrief[];
  seq: number;
  redteam: Record<string, boolean>;
  setView: (view: DeskView) => void;
  setRecipe: (recipeId: string) => void;
  setSelectedRole: (role: RoleId) => void;
  setBriefRole: (role: RoleId) => void;
  patchBrief: (patch: Partial<Brief>) => void;
  prefill: (kind: "css" | "omer") => void;
  clearBrief: () => void;
  fileBrief: (entry: FiledBrief) => void;
  setMark: (stage: "v001" | "v002", id: string, state: CitationState) => void;
  setDisposition: (stage: "v001" | "v002", value: Disposition) => void;
  setNote: (stage: "v001" | "v002", note: string) => void;
  advance: (phase: DrillPhase) => void;
  setPiAck: (value: boolean) => void;
  lockHypothesis: () => void;
  setAfrRank: (rank: Rank) => void;
  setAfrNote: (note: string) => void;
  toggleRedteam: (id: string) => void;
  resetDrill: () => void;
  clearBriefs: () => void;
};

const drillDefaults = {
  phase: "review-v001" as DrillPhase,
  marks1: {},
  disposition1: "" as const,
  note1: "",
  marks2: {},
  disposition2: "" as const,
  note2: "",
  piAck: false,
  hypothesisLocked: false,
  afrRank: "" as const,
  afrNote: "",
};

export const useDesk = create<DeskState>()(
  persist(
    (set) => ({
      view: "desk",
      recipeId: "corpus",
      selectedRole: "CSS",
      briefRole: "CSS",
      brief: EMPTY_BRIEF,
      ...drillDefaults,
      assignments: [],
      seq: 10,
      redteam: {},
      setView: (view) => set({ view }),
      setRecipe: (recipeId) => set({ recipeId }),
      setSelectedRole: (selectedRole) => set({ selectedRole }),
      setBriefRole: (briefRole) => set({ briefRole }),
      patchBrief: (patch) => set((state) => ({ brief: { ...state.brief, ...patch } })),
      prefill: (kind) =>
        set({
          view: "brief",
          briefRole: kind === "css" ? "CSS" : "OMER",
          brief: kind === "css" ? CSS_PREFILL : OMER_PREFILL,
        }),
      clearBrief: () => set({ brief: EMPTY_BRIEF, briefRole: "CSS" }),
      fileBrief: (entry) =>
        set((state) => ({
          assignments: [entry, ...state.assignments],
          seq: state.seq + 1,
          view: "ledger",
        })),
      setMark: (stage, id, citation) =>
        set((state) =>
          stage === "v001"
            ? { marks1: { ...state.marks1, [id]: citation } }
            : { marks2: { ...state.marks2, [id]: citation } },
        ),
      setDisposition: (stage, value) =>
        set(stage === "v001" ? { disposition1: value } : { disposition2: value }),
      setNote: (stage, note) => set(stage === "v001" ? { note1: note } : { note2: note }),
      advance: (phase) => set({ phase }),
      setPiAck: (piAck) => set({ piAck }),
      lockHypothesis: () => set({ hypothesisLocked: true, phase: "challenge" }),
      setAfrRank: (afrRank) => set({ afrRank }),
      setAfrNote: (afrNote) => set({ afrNote }),
      toggleRedteam: (id) =>
        set((state) => ({ redteam: { ...state.redteam, [id]: !state.redteam[id] } })),
      resetDrill: () => set({ ...drillDefaults }),
      clearBriefs: () => set({ assignments: [], seq: 10 }),
    }),
    { name: "race-desk-v1", skipHydration: true },
  ),
);
