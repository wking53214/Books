import { useEffect } from "react";
import type { DeskView } from "@/lib/race/data";
import { useDesk } from "@/lib/race/store";
import { cn } from "@/lib/cn";
import { AuditView } from "./view-audit";
import { BriefView } from "./view-brief";
import { DeskHome } from "./view-desk";
import { GatesView } from "./view-gates";
import { LedgerView } from "./view-ledger";
import { RolesView } from "./view-roles";

const NAV: { id: DeskView; label: string }[] = [
  { id: "desk", label: "Desk" },
  { id: "roles", label: "Roles" },
  { id: "brief", label: "Brief" },
  { id: "ledger", label: "Ledger" },
  { id: "gates", label: "Gates" },
  { id: "audit", label: "Audit" },
];

export function RaceDesk() {
  const view = useDesk((s) => s.view);
  const setView = useDesk((s) => s.setView);

  useEffect(() => {
    void useDesk.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-4 gap-y-1 px-4 pt-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-cinnabar uppercase">STACK RACE</p>
            <p className="font-display text-2xl leading-none text-fg">RACE Desk</p>
          </div>
          <p className="pb-1 text-xs text-muted">Design instrument · no source research authorized</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2" aria-label="Desk sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={cn(
                "min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold",
                view === item.id ? "border-cinnabar text-fg" : "border-transparent text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === "desk" ? <DeskHome /> : null}
        {view === "roles" ? <RolesView /> : null}
        {view === "brief" ? <BriefView /> : null}
        {view === "ledger" ? <LedgerView /> : null}
        {view === "gates" ? <GatesView /> : null}
        {view === "audit" ? <AuditView /> : null}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted">
        STACK RACE Prompt Architecture v1.0, under Research Charter v1.0. Practice records stay in this browser. A score, a prompt, and a clean packet are not findings.
      </footer>
    </div>
  );
}
