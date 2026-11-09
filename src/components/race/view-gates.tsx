import { GATES, PRACTICE_CHALLENGE, PRACTICE_HYPOTHESIS, currentGate, type Rank } from "@/lib/race/data";
import { gradeChallenge } from "@/lib/race/judge";
import { useDesk } from "@/lib/race/store";
import { Chip, Kicker, Panel, Paper, TextButton } from "./bits";
import { cn } from "@/lib/cn";

const RANKS: Rank[] = ["CRITICAL", "MATERIAL", "LIMITED", "SPECULATIVE"];

export function GatesView() {
  const phase = useDesk((s) => s.phase);
  const piAck = useDesk((s) => s.piAck);
  const hypothesisLocked = useDesk((s) => s.hypothesisLocked);
  const afrRank = useDesk((s) => s.afrRank);
  const afrNote = useDesk((s) => s.afrNote);
  const setPiAck = useDesk((s) => s.setPiAck);
  const lockHypothesis = useDesk((s) => s.lockHypothesis);
  const setAfrRank = useDesk((s) => s.setAfrRank);
  const setAfrNote = useDesk((s) => s.setAfrNote);
  const advance = useDesk((s) => s.advance);
  const setView = useDesk((s) => s.setView);
  const gate = currentGate(phase);
  const passedAcceptance = phase === "synthesis" || phase === "challenge" || phase === "complete";

  const submitChallenge = () => {
    const grade = gradeChallenge(afrRank);
    setAfrNote(grade.notes.join(" "));
    if (grade.pass) advance("complete");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="grid gap-3 lg:col-span-5">
        <Kicker>Eight charter gates</Kicker>
        <h2 className="font-display text-3xl text-fg">Where this drill sits</h2>
        <ol className="grid gap-2">
          {GATES.map((item) => {
            const state =
              item.id < "03" || (item.id === "03" && passedAcceptance) || (item.id === "04" && (phase === "challenge" || phase === "complete")) || (item.id === "05" && phase === "complete")
                ? "done"
                : item.id === gate
                  ? "now"
                  : "wait";
            return (
              <li key={item.id} className={cn("border px-3 py-3", state === "now" ? "border-cinnabar bg-ink-2" : "border-line")}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg text-fg">
                    <span className="mr-2 text-cinnabar tabular-nums">{item.id}</span>
                    {item.name}
                  </p>
                  <span className="text-xs tracking-wide text-muted uppercase">
                    {state === "done" ? "Passed" : state === "now" ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
                <p className="mt-1 text-xs text-muted">{item.who}</p>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid content-start gap-4 lg:col-span-7">
        {!passedAcceptance ? (
          <Panel className="grid gap-3 p-5">
            <Kicker>Gate 03 is still open</Kicker>
            <p className="text-fg">Synthesis is locked until the packet clears integrity. A polished narrative is not a reason to skip the auditor.</p>
            <TextButton onClick={() => setView("ledger")}>Return to the packet</TextButton>
          </Panel>
        ) : null}

        {phase === "synthesis" ? (
          <Paper className="grid gap-3 p-5">
            <Kicker>Gate 04 · Fable only</Kicker>
            <h3 className="font-display text-2xl">Record the practice hypothesis</h3>
            <p className="text-sm">
              Assistants do not write this. The wording stays fixed so the challenger cannot be aimed at a caricature.
            </p>
            <blockquote className="bg-paper px-3 py-3 text-sm">{PRACTICE_HYPOTHESIS}</blockquote>
            <label className="flex min-h-11 items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1" checked={piAck} onChange={(event) => setPiAck(event.target.checked)} />
              I am recording this as PI practice synthesis. No assistant owns this conclusion.
            </label>
            <TextButton tone="paper" disabled={!piAck} onClick={lockHypothesis}>
              Send to adversarial review
            </TextButton>
          </Paper>
        ) : null}

        {phase === "challenge" || phase === "complete" ? (
          <Paper className="grid gap-3 p-5">
            <Kicker>Gate 05 · challenge the recorded wording</Kicker>
            <p className="text-sm">{hypothesisLocked ? PRACTICE_HYPOTHESIS : null}</p>
            <p className="text-sm">
              <span className="font-semibold">{PRACTICE_CHALLENGE.label}. </span>
              {PRACTICE_CHALLENGE.text}
            </p>
            <p className="text-sm text-ink-soft">{PRACTICE_CHALLENGE.alternative}</p>
            <p className="text-xs text-ink-soft">Source {PRACTICE_CHALLENGE.source}. Rank by evidence, not by tone.</p>
            {phase === "challenge" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {RANKS.map((rank) => (
                    <button
                      key={rank}
                      type="button"
                      onClick={() => setAfrRank(rank)}
                      className={cn(
                        "min-h-11 text-sm font-semibold",
                        afrRank === rank ? "bg-ink-text text-parchment" : "bg-paper text-ink-text",
                      )}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
                <TextButton tone="paper" onClick={submitChallenge}>
                  Submit the ranking
                </TextButton>
              </>
            ) : (
              <Chip tone="paper">Challenge ranked MATERIAL</Chip>
            )}
            {afrNote ? <p className="text-sm">{afrNote}</p> : null}
          </Paper>
        ) : null}

        {phase === "complete" ? (
          <Panel className="grid gap-3 p-5">
            <Kicker>Drill closed inside the architecture</Kicker>
            <h3 className="font-display text-2xl text-fg">Gates 06 through 08 stay shut</h3>
            <p className="text-sm text-muted">
              No test was authorized, so IVR does not run. OMER was never activated: there is no recorded finding past an initial evidence threshold, and the sponsor has not been asked to dispose of anything. Closure can wait for a real trigger.
            </p>
            <p className="text-sm text-fg">
              Fable is the only AI Principal Investigator. The assistants brought a folder inventory. The inventory did not become truth because it arrived in a packet.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
