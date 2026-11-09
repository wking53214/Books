import { useState } from "react";
import {
  CITATION_STATES,
  CLAIMS_V1,
  CLAIMS_V2,
  type CitationState,
  type Disposition,
  type DrillClaim,
} from "@/lib/race/data";
import { gradePacket } from "@/lib/race/judge";
import { useDesk } from "@/lib/race/store";
import { Chip, Kicker, Panel, Paper, TextButton } from "./bits";
import { cn } from "@/lib/cn";

const DISPOSITIONS: Disposition[] = [
  "PASS FOR PI SYNTHESIS",
  "PASS WITH RESERVATIONS",
  "RETURN FOR CORRECTION",
  "BLOCKED",
];

function ClaimCard({
  claim,
  mark,
  onMark,
}: {
  claim: DrillClaim;
  mark: CitationState | "";
  onMark: (state: CitationState) => void;
}) {
  return (
    <Paper className="grid gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="paper">{claim.id}</Chip>
        <Chip tone="paper">{claim.label}</Chip>
        <span className="text-xs text-ink-soft">CSS asserted {claim.asserted.replaceAll("_", " ")}</span>
      </div>
      <p className="font-semibold">{claim.statement}</p>
      <blockquote className="border-l-4 border-l-cinnabar-deep bg-paper px-3 py-2 text-sm">
        {claim.extract}
      </blockquote>
      <p className="text-sm text-ink-soft">{claim.context}</p>
      <p className="text-xs text-ink-soft">
        {claim.evidenceId} · {claim.sourceId} · confidence {claim.confidence} — {claim.rationale}
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Citation state for ${claim.id}`}>
        {CITATION_STATES.map((state) => {
          const active = mark === state.id;
          return (
            <button
              key={state.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onMark(state.id)}
              className={cn(
                "min-h-11 px-3 text-xs font-semibold tracking-wide",
                active ? "bg-cinnabar-deep text-parchment" : "bg-paper text-ink-text",
              )}
            >
              {state.id.replaceAll("_", " ")}
            </button>
          );
        })}
      </div>
    </Paper>
  );
}

function Review({ stage }: { stage: "v001" | "v002" }) {
  const claims = stage === "v001" ? CLAIMS_V1 : CLAIMS_V2;
  const marks = useDesk((s) => (stage === "v001" ? s.marks1 : s.marks2));
  const disposition = useDesk((s) => (stage === "v001" ? s.disposition1 : s.disposition2));
  const note = useDesk((s) => (stage === "v001" ? s.note1 : s.note2));
  const setMark = useDesk((s) => s.setMark);
  const setDisposition = useDesk((s) => s.setDisposition);
  const setNote = useDesk((s) => s.setNote);
  const advance = useDesk((s) => s.advance);

  const submit = () => {
    const grade = gradePacket(stage, marks, disposition);
    setNote(stage, grade.notes.join(" "));
    if (!grade.pass) return;
    advance(stage === "v001" ? "correction-filed" : "synthesis");
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Asserted states are the producer’s claim. Open the extract and assign your own. Inaccessible is never verified.
      </p>
      {claims.map((claim) => (
        <ClaimCard
          key={claim.id}
          claim={claim}
          mark={marks[claim.id] ?? ""}
          onMark={(state) => setMark(stage, claim.id, state)}
        />
      ))}
      <Panel className="grid gap-3 p-4">
        <p className="text-sm font-semibold text-fg">Packet-integrity disposition</p>
        <div className="grid gap-2">
          {DISPOSITIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDisposition(stage, item)}
              className={cn(
                "min-h-11 px-3 text-left text-sm",
                disposition === item ? "bg-cinnabar-deep text-parchment" : "border border-line text-fg",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <TextButton onClick={submit}>File integrity disposition</TextButton>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </Panel>
    </div>
  );
}

export function LedgerView() {
  const phase = useDesk((s) => s.phase);
  const assignments = useDesk((s) => s.assignments);
  const setView = useDesk((s) => s.setView);
  const advance = useDesk((s) => s.advance);
  const [showFiled, setShowFiled] = useState(false);
  const packetVersion = phase === "review-v001" || phase === "correction-filed" ? "v001" : "v002";

  return (
    <div className="grid gap-6">
      <div>
        <Kicker>Ledger · synthetic case SYN-BOUNDARY-01</Kicker>
        <h2 className="mt-1 font-display text-3xl text-fg">Harbor Ledger, Sample Folio 12</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Packet PKT-ASG-SYN-0001. CSS submitted a folder inventory. Your job is the integrity audit, not a reading of the folio.
        </p>
      </div>

      {phase === "review-v001" ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="cinnabar">v001 · submitted</Chip>
            <Chip>Gate 03</Chip>
          </div>
          <Review stage="v001" />
        </div>
      ) : null}

      {phase === "correction-filed" ? (
        <Paper className="grid gap-3 p-5">
          <Kicker>No silent overwrite</Kicker>
          <h3 className="font-display text-2xl">v001 stays. v002 is a new packet.</h3>
          <p className="text-sm">
            The mismatch is on the record. The correction does not erase it. v002 restates CLM-SYN-03 so the claim matches the extract: two leaves inspected, Copy-C not in the folder.
          </p>
          <TextButton tone="paper" onClick={() => advance("review-v002")}>
            Open v002 for audit
          </TextButton>
        </Paper>
      ) : null}

      {phase === "review-v002" ? <Review stage="v002" /> : null}

      {phase === "synthesis" || phase === "challenge" || phase === "complete" ? (
        <Panel className="grid gap-3 p-5">
          <Chip tone="sage">Packet accepted for PI synthesis</Chip>
          <p className="text-fg">
            {packetVersion === "v002"
              ? "v002 cleared the integrity gate with the coverage limit disclosed. That still does not make the hypothesis true."
              : "The packet moved on."}
          </p>
          <TextButton onClick={() => setView("gates")}>Go to the PI gate</TextButton>
        </Panel>
      ) : null}

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl text-fg">Briefs you issued</h3>
          <button type="button" className="min-h-11 text-sm text-cinnabar" onClick={() => setShowFiled((value) => !value)}>
            {showFiled ? "Hide" : "Show"} {assignments.length} filed
          </button>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">None yet. A blocked brief is not filed. Fix the missing fields, then issue it.</p>
        ) : showFiled || assignments.length > 0 ? (
          <ul className="grid gap-3">
            {assignments.map((item) => (
              <li key={item.id} className="border border-line bg-ink-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="sage">{item.line}</Chip>
                  <Chip>{item.role}</Chip>
                </div>
                <p className="mt-2 font-semibold text-fg">{item.id}</p>
                <p className="mt-1 text-sm text-muted">{item.brief.researchQuestion}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
