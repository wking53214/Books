import { AMENDMENTS, RED_TEAM, SCORECARD, THREATS } from "@/lib/race/data";
import { useDesk } from "@/lib/race/store";
import { Kicker, Panel, Paper, TextButton } from "./bits";

export function AuditView() {
  const redteam = useDesk((s) => s.redteam);
  const toggle = useDesk((s) => s.toggleRedteam);
  const resetDrill = useDesk((s) => s.resetDrill);
  const clearBriefs = useDesk((s) => s.clearBriefs);
  const checked = RED_TEAM.filter((_, index) => redteam[String(index)]).length;

  return (
    <div className="grid gap-6">
      <div>
        <Kicker>Design audit · not an operational certificate</Kicker>
        <h2 className="mt-1 font-display text-3xl text-fg">Approve for controlled prompt testing</h2>
        <p className="mt-2 max-w-2xl text-muted">
          The paper architecture scores 8.85. That means it is coherent enough to test. It does not mean the system is ready for autonomous or high-stakes research.
        </p>
      </div>

      <div className="grid gap-3">
        {SCORECARD.map((row) => (
          <div key={row.name} className="grid gap-1 border border-line bg-ink-2 p-3 sm:grid-cols-[14rem_4rem_1fr] sm:items-center">
            <span className="text-sm text-fg">{row.name}</span>
            <span className="font-display text-xl text-cinnabar tabular-nums">{row.score.toFixed(1)}</span>
            <span className="text-sm text-muted">{row.note}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <h3 className="font-display text-2xl text-fg">Threats the prompts can see</h3>
          {THREATS.map((row) => (
            <Panel key={row.threat} className="p-4">
              <p className="font-semibold text-fg">{row.threat}</p>
              <p className="mt-1 text-sm text-muted">{row.control}</p>
              <p className="mt-1 text-sm text-sage">Residual: {row.residual}</p>
            </Panel>
          ))}
        </div>
        <div className="grid content-start gap-4">
          <Paper className="grid gap-3 p-5">
            <Kicker>Before a prompt revision ships</Kicker>
            <p className="text-sm">
              {checked} of {RED_TEAM.length} red-team questions acknowledged. Any “yes” means revise the prompt or add a control outside it.
            </p>
            <ul className="grid gap-2">
              {RED_TEAM.map((question, index) => {
                const id = String(index);
                return (
                  <li key={question}>
                    <label className="flex min-h-11 items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={Boolean(redteam[id])}
                        onChange={() => toggle(id)}
                      />
                      <span>{question}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Paper>
          <div className="grid gap-3">
            <h3 className="font-display text-2xl text-fg">Proposed Charter amendments</h3>
            <p className="text-sm text-muted">Not in force. Sponsor review would have to adopt them.</p>
            {AMENDMENTS.map((item) => (
              <Panel key={item.id} className="p-4">
                <p className="text-xs tracking-widest text-cinnabar uppercase">{item.id}</p>
                <p className="mt-1 font-semibold text-fg">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </Panel>
            ))}
          </div>
        </div>
      </div>

      <Panel className="grid gap-3 p-5">
        <h3 className="font-display text-2xl text-fg">Three weaknesses the desk does not fix</h3>
        <ol className="grid gap-3 text-sm text-muted">
          <li>1. Prompts do not enforce immutable records, access control, or schema checks. Those live in a repository this practice desk does not pretend to be.</li>
          <li>2. Disclosing a language limit does not create a philologist, counsel, or regulator.</li>
          <li>3. One PI prevents model democracy and concentrates interpretation. The mitigation is the log, the blind challenge, the auditor, and human review — not a second PI.</li>
        </ol>
        <div className="flex flex-wrap gap-3">
          <TextButton tone="ghost" onClick={resetDrill}>
            Reset the folio drill
          </TextButton>
          <TextButton tone="ghost" onClick={clearBriefs}>
            Clear issued briefs
          </TextButton>
        </div>
      </Panel>
    </div>
  );
}
