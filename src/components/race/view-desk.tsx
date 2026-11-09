import { HIERARCHY, RECIPES, SCORECARD, drillSteps } from "@/lib/race/data";
import { useDesk } from "@/lib/race/store";
import { Chip, Kicker, Panel, Paper, TextButton } from "./bits";

const RULES = [
  {
    who: "Evidence Integrity Auditor",
    ask: "Can we trust and reconstruct this packet?",
  },
  {
    who: "Adversarial researcher",
    ask: "What could make the hypothesis wrong?",
  },
  {
    who: "Fable, the only PI",
    ask: "What, if anything, does the evidence justify next?",
  },
];

export function DeskHome() {
  const phase = useDesk((s) => s.phase);
  const recipeId = useDesk((s) => s.recipeId);
  const setRecipe = useDesk((s) => s.setRecipe);
  const setView = useDesk((s) => s.setView);
  const prefill = useDesk((s) => s.prefill);
  const setBriefRole = useDesk((s) => s.setBriefRole);
  const recipe = RECIPES.find((item) => item.id === recipeId) ?? RECIPES[0];
  const steps = drillSteps(phase);
  const openDrill = () => {
    if (phase === "synthesis" || phase === "challenge" || phase === "complete") {
      setView("gates");
      return;
    }
    setView("ledger");
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-7">
          <Kicker>Architecture v1.0 · practice lane</Kicker>
          <h1 className="font-display text-4xl leading-tight text-fg sm:text-5xl">
            Ten roles. One PI. A packet is not a verdict.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            RACE Desk rehearses the STACK source-first operating system. Fable remains the only
            investigator. Nothing here is field research.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {RULES.map((rule) => (
              <Paper key={rule.who} className="p-4">
                <p className="text-xs font-semibold text-cinnabar-deep uppercase">
                  {rule.who}
                </p>
                <p className="mt-2 font-display text-xl leading-snug">{rule.ask}</p>
              </Paper>
            ))}
          </div>
        </div>
        <Panel className="p-5 lg:col-span-5">
          <Kicker>Chain of responsibility</Kicker>
          <ol className="mt-4 grid gap-3">
            {HIERARCHY.map((row, index) => (
              <li key={row.name} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-display text-lg text-cinnabar tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-semibold text-fg">{row.name}</span>
                  <span className="block text-sm text-muted">{row.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel className="grid gap-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Kicker>Synthetic drill · Harbor Ledger</Kicker>
            <h2 className="mt-1 font-display text-2xl text-fg">Sample Folio 12</h2>
          </div>
          <Chip tone="cinnabar">Not a source study</Chip>
        </div>
        <p className="max-w-3xl text-muted">
          A CSS packet claims three witnesses were inspected. The folder extract does not say
          that. Audit it, keep the broken version, then let only the PI record a hypothesis — and
          watch a catalog card narrow it.
        </p>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="flex items-center gap-3 border border-line bg-ink px-3 py-3"
            >
              <span
                className={
                  step.state === "now"
                    ? "font-display text-lg text-cinnabar tabular-nums"
                    : "font-display text-lg text-muted tabular-nums"
                }
              >
                {step.n}
              </span>
              <span className="text-sm text-fg">{step.label}</span>
              <span className="ml-auto text-xs tracking-wide text-muted uppercase">
                {step.state === "done" ? "Done" : step.state === "now" ? "Now" : "Waiting"}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <TextButton onClick={openDrill}>
            {phase === "complete" ? "Review the closed drill" : "Continue the drill"}
          </TextButton>
          <TextButton tone="ghost" onClick={() => setView("roles")}>
            Read the role prompts
          </TextButton>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-7">
          <Kicker>Activation planner</Kicker>
          <h2 className="font-display text-2xl text-fg">Not ten agents on every question</h2>
          <label className="grid gap-2 text-sm text-muted">
            Question type
            <select
              className="min-h-11 border border-line bg-ink-2 px-3 text-fg"
              value={recipeId}
              onChange={(event) => setRecipe(event.target.value)}
            >
              {RECIPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <Panel className="p-4">
              <p className="text-xs tracking-widest text-sage uppercase">Activate</p>
              <p className="mt-2 text-fg">
                {recipe.activate.length ? recipe.activate.join(" · ") : "No assistant"}
              </p>
            </Panel>
            <Panel className="p-4">
              <p className="text-xs tracking-widest text-muted uppercase">Optional</p>
              <p className="mt-2 text-fg">
                {recipe.optional.length ? recipe.optional.join(" · ") : "None"}
              </p>
            </Panel>
            <Panel className="p-4">
              <p className="text-xs tracking-widest text-cinnabar uppercase">Hold</p>
              <p className="mt-2 text-sm text-fg">{recipe.hold}</p>
            </Panel>
          </div>
          <div className="flex flex-wrap gap-3">
            {recipe.primary ? (
              <TextButton
                onClick={() => {
                  if (recipe.primary === "OMER") prefill("omer");
                  else if (recipe.primary === "CSS") prefill("css");
                  else if (recipe.primary) {
                    setBriefRole(recipe.primary);
                    setView("brief");
                  }
                }}
              >
                Draft a {recipe.primary} brief
              </TextButton>
            ) : (
              <TextButton onClick={() => setView("gates")}>Synthesis stays with Fable</TextButton>
            )}
          </div>
        </div>
        <Panel className="p-5 lg:col-span-5">
          <Kicker>Paper score · not field performance</Kicker>
          <p className="mt-2 font-display text-4xl text-fg tabular-nums">8.85</p>
          <p className="text-sm text-muted">Unweighted mean of the design scorecard. Above 8 means ready to test the prompts, not to run them unattended.</p>
          <ul className="mt-4 grid gap-2">
            {SCORECARD.slice(0, 4).map((row) => (
              <li key={row.name} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                <span className="text-fg">{row.name}</span>
                <span className="text-muted tabular-nums">{row.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setView("audit")}
            className="mt-4 min-h-11 text-sm font-semibold text-cinnabar"
          >
            Full scorecard and threat model
          </button>
        </Panel>
      </div>
    </div>
  );
}
