import { useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { DEPLOY_STEPS, ROLES, deployablePrompt, type RoleId } from "@/lib/race/data";
import { useDesk } from "@/lib/race/store";
import { Chip, Kicker, Panel, Paper, TextButton } from "./bits";

export function RolesView() {
  const selected = useDesk((s) => s.selectedRole);
  const setSelected = useDesk((s) => s.setSelectedRole);
  const setView = useDesk((s) => s.setView);
  const setBriefRole = useDesk((s) => s.setBriefRole);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const role = ROLES.find((item) => item.id === selected) ?? ROLES[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(deployablePrompt(role));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (open) {
    return (
      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All roles
        </button>
        <Paper className="grid gap-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Kicker>
                Prompt {role.number} · {role.id}
                {role.conditional ? " · conditional" : ""}
              </Kicker>
              <h2 className="mt-1 font-display text-3xl">{role.name}</h2>
            </div>
            <TextButton tone="paper" onClick={() => void copy()}>
              {copied ? <Check className="mr-2 size-4" aria-hidden="true" /> : <Copy className="mr-2 size-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy prompt"}
            </TextButton>
          </div>
          <p className="text-lg">{role.question}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-widest text-cinnabar-deep uppercase">Owns</p>
              <ul className="mt-2 grid gap-1 text-sm">
                {role.owns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Does not own</p>
              <ul className="mt-2 grid gap-1 text-sm">
                {role.doesNot.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-sm text-ink-soft">{role.why}</p>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase">Deploy with</p>
            <ol className="mt-2 grid gap-1 text-sm">
              {DEPLOY_STEPS.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase">Action</p>
            <ol className="mt-2 grid gap-2 text-sm">
              {role.actions.map((step, index) => (
                <li key={step} className="grid grid-cols-[1.5rem_1fr] gap-2">
                  <span className="tabular-nums text-cinnabar-deep">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm">{role.context}</p>
          <p className="text-sm">
            <span className="font-semibold">Prohibited. </span>
            {role.prohibited}
          </p>
          <div className="flex flex-wrap gap-2">
            {role.endings.map((ending) => (
              <Chip key={ending} tone="paper">
                {ending}
              </Chip>
            ))}
          </div>
          <TextButton
            tone="paper"
            onClick={() => {
              setBriefRole(role.id);
              setView("brief");
            }}
          >
            Draft a {role.id} brief
          </TextButton>
        </Paper>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <Kicker>Role pool</Kicker>
        <h2 className="mt-1 font-display text-3xl text-fg">Nine core roles, one conditional</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Fable activates the minimum set and records why the others stayed off. OMER does not run during open source investigation.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelected(item.id as RoleId);
              setOpen(true);
              setCopied(false);
            }}
            className="border border-line bg-ink-2 p-4 text-left hover:border-cinnabar"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-lg text-cinnabar tabular-nums">
                {String(item.number).padStart(2, "0")}
              </span>
              {item.conditional ? <Chip tone="cinnabar">Conditional</Chip> : <Chip>{item.id}</Chip>}
            </div>
            <h3 className="mt-3 font-display text-2xl text-fg">{item.name}</h3>
            <p className="mt-2 text-sm text-muted">{item.question}</p>
          </button>
        ))}
      </div>
      <Panel className="hidden p-4 sm:block">
        <p className="text-sm text-muted">
          Selected for reference: <span className="text-fg">{role.name}</span>. Open a folio to copy the deployable prompt.
        </p>
      </Panel>
    </div>
  );
}
