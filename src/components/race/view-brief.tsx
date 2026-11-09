import { ROLE_BY_ID, ROLES, type ExecutionPermission, type Independence, type RiskTier, type Classification, type RoleId } from "@/lib/race/data";
import { assistantEnding, briefYaml, judgeBrief } from "@/lib/race/judge";
import { useDesk } from "@/lib/race/store";
import { Chip, Kicker, Panel, Paper, TextButton } from "./bits";

const INDEPENDENCE: Independence[] = ["NONE", "PARTIAL", "BLIND_FIRST_PASS", "INDEPENDENT_PROVIDER"];
const RISKS: RiskTier[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
const CLASSES: Classification[] = ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED", "LEGALLY_CONTROLLED"];
const EXEC: ExecutionPermission[] = ["NONE", "READ_ONLY", "SANDBOX_TEST", "SPECIFIC_APPROVED_ACTION"];

function Field({
  label,
  value,
  onChange,
  long,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  long?: boolean;
  hint?: string;
}) {
  const className = "min-h-11 w-full border border-paper bg-parchment px-3 py-2 text-ink-text";
  return (
    <label className="grid gap-1 text-sm text-ink-soft">
      <span className="font-semibold text-ink-text">{label}</span>
      {long ? (
        <textarea className={className} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={className} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <span>{hint}</span> : null}
    </label>
  );
}

export function BriefView() {
  const roleId = useDesk((s) => s.briefRole);
  const brief = useDesk((s) => s.brief);
  const setBriefRole = useDesk((s) => s.setBriefRole);
  const patchBrief = useDesk((s) => s.patchBrief);
  const prefill = useDesk((s) => s.prefill);
  const clearBrief = useDesk((s) => s.clearBrief);
  const fileBrief = useDesk((s) => s.fileBrief);
  const seq = useDesk((s) => s.seq);
  const role = ROLE_BY_ID[roleId];
  const verdict = judgeBrief(roleId, brief);
  const ending = assistantEnding(roleId, verdict.status);

  const issue = () => {
    if (verdict.status !== "ISSUED") return;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    fileBrief({
      id: `ASG-${y}${m}${d}-${String(seq).padStart(4, "0")}`,
      role: roleId,
      brief,
      line: verdict.line,
      missing: verdict.missing,
      filedAt: now.toISOString(),
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <form
        className="grid gap-4 lg:col-span-7"
        onSubmit={(event) => {
          event.preventDefault();
          issue();
        }}
      >
        <div>
          <Kicker>Master assignment brief</Kicker>
          <h2 className="mt-1 font-display text-3xl text-fg">One role. One boundary.</h2>
          <p className="mt-2 text-muted">
            Missing scope blocks the issue. The desk will not invent a corpus, a hypothesis, or a commercial gate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TextButton tone="ghost" onClick={() => prefill("css")}>
            Fill a valid CSS brief
          </TextButton>
          <TextButton tone="ghost" onClick={() => prefill("omer")}>
            Show the commercial block
          </TextButton>
          <TextButton tone="ghost" onClick={clearBrief}>
            Clear
          </TextButton>
        </div>
        <Paper className="grid gap-4 p-4 sm:p-5">
          <label className="grid gap-1 text-sm text-ink-soft">
            <span className="font-semibold text-ink-text">Assigned role</span>
            <select
              className="min-h-11 border border-paper bg-parchment px-3 text-ink-text"
              value={roleId}
              onChange={(event) => setBriefRole(event.target.value as RoleId)}
            >
              {ROLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} — {item.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Research question or evidence need" long value={brief.researchQuestion} onChange={(researchQuestion) => patchBrief({ researchQuestion })} />
          <Field label="Why this assignment exists" long value={brief.why} onChange={(why) => patchBrief({ why })} />
          <Field label="Expected next gate" value={brief.nextGate} onChange={(nextGate) => patchBrief({ nextGate })} />
          <Field label="Corpus or domain" value={brief.corpus} onChange={(corpus) => patchBrief({ corpus })} />
          <Field label="Inclusions" long value={brief.inclusions} onChange={(inclusions) => patchBrief({ inclusions })} />
          <Field label="Exclusions" long value={brief.exclusions} onChange={(exclusions) => patchBrief({ exclusions })} />
          <Field label="Required coverage" long value={brief.coverage} onChange={(coverage) => patchBrief({ coverage })} />
          <Field
            label="Edition or language bounds"
            value={brief.editionBounds}
            onChange={(editionBounds) => patchBrief({ editionBounds })}
            hint={roleId === "OLTA" ? "Required for OLTA. Do not mix editions silently." : "Required when the role is OLTA."}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Parent discovery ID" value={brief.parentDiscovery} onChange={(parentDiscovery) => patchBrief({ parentDiscovery })} hint="Required for OMER." />
            <Field label="Parent hypothesis ID" value={brief.parentHypothesis} onChange={(parentHypothesis) => patchBrief({ parentHypothesis })} hint="Required for AFR and IVR." />
          </div>
          <Field label="Packet under audit" value={brief.packetRef} onChange={(packetRef) => patchBrief({ packetRef })} hint="Required for EIA." />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Independence</span>
              <select className="min-h-11 border border-paper bg-parchment px-3" value={brief.independence} onChange={(event) => patchBrief({ independence: event.target.value as Independence })}>
                {INDEPENDENCE.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Risk tier</span>
              <select className="min-h-11 border border-paper bg-parchment px-3" value={brief.risk} onChange={(event) => patchBrief({ risk: event.target.value as RiskTier })}>
                {RISKS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Data classification</span>
              <select className="min-h-11 border border-paper bg-parchment px-3" value={brief.classification} onChange={(event) => patchBrief({ classification: event.target.value as Classification })}>
                {CLASSES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Execution permission</span>
              <select className="min-h-11 border border-paper bg-parchment px-3" value={brief.execution} onChange={(event) => patchBrief({ execution: event.target.value as ExecutionPermission })}>
                {EXEC.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <Field label="Access authorization reference" value={brief.accessRef} onChange={(accessRef) => patchBrief({ accessRef })} />
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={brief.humanApproval} onChange={(event) => patchBrief({ humanApproval: event.target.checked })} />
            Human approval is recorded for this risk
          </label>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1" checked={brief.commercialGate} onChange={(event) => patchBrief({ commercialGate: event.target.checked })} />
            <span>The finding is recorded and has passed the Charter §11.1 evidence threshold. Required before OMER can be issued.</span>
          </label>
          <TextButton type="submit" tone="paper" disabled={verdict.status !== "ISSUED"}>
            Issue assignment
          </TextButton>
        </Paper>
      </form>
      <div className="grid gap-4 lg:col-span-5 lg:self-start">
        <Panel className="grid gap-3 p-5">
          <Kicker>Live verdict</Kicker>
          <p className="font-display text-2xl text-fg">{verdict.line}</p>
          <Chip tone={verdict.status === "ISSUED" ? "sage" : "cinnabar"}>{verdict.status}</Chip>
          {verdict.missing.length > 0 ? (
            <ul className="grid gap-1 text-sm text-muted">
              {verdict.missing.map((item) => (
                <li key={item}>Missing: {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Scope is complete enough to issue. Issuing is not acceptance, and it is not a finding.</p>
          )}
          <p className="text-sm text-fg">
            If this role later returns work, a legal ending is: {ending}
          </p>
          <p className="text-sm text-muted">{role.prohibited}</p>
        </Panel>
        {verdict.status === "ISSUED" ? (
          <Paper className="p-4">
            <p className="text-xs font-semibold tracking-widest text-cinnabar-deep uppercase">Brief preview</p>
            <pre className="mt-3 overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap text-ink-text">
              {briefYaml(`ASG-PREVIEW-${roleId}`, roleId, brief, verdict.line)}
            </pre>
          </Paper>
        ) : null}
      </div>
    </div>
  );
}
