# Books (RACE Desk)

A small web app, exported from Grok's App Builder, that works as a practice desk for the "STACK RACE Prompt Architecture", the ten-role research design of the Source-First Discovery Program: issuing role briefs, grading citation drills, keeping a ledger and walking through gates. The app's own title is "RACE Desk" (`src/lib/og/site.json`). This repository is named Books; the name does not describe the content. The design it practices is not the framework in the RACE repository (Role, Action, Context, Expectation). The two share only the name.

## Status

Exported prototype. The history is a single commit, "Export from Grok". Nothing here has been deployed or reviewed by this project, and no claim in this README goes beyond what the checks below show.

## Role Within ≡TACK

- **What it is.** A front-end exercise desk. It lets a person fill in a brief for a role (for example OLTA, AFR, IVR, EIA, OMER, TSRE), see whether the brief would be ISSUED or BLOCKED by a set of completeness rules, mark citations in two drills, and review a ledger, gates and an audit view. The role names and rules come from `attachments/STACK_RACE_Architecture_v1.0.md`, a markdown copy of the STACK RACE Prompt Architecture v1.0, whose own status line calls it a design proposal that is not field-validated. The frozen copy of that document is a PDF in the discovery-records repository; this copy was not compared with it.
- **Authority matrix.** Policy definition and evaluation, in part and only inside the browser: the "judge" (`src/lib/race/judge.ts`) holds completeness rules for a brief and the answer keys for the drills, and applies them. Nothing else. It is a practice and demonstration tool. It does not enforce anything outside the browser, authorize anything, authenticate anyone for ≡TACK, or generate evidence that any other repository reads. An ISSUED brief is text on the screen: its "issued by" line is fixed text that names the Principal Investigator whoever fills in the form, and "human approval" is a box that the person at the keyboard ticks (INSPECTED 2026-11-18).
- **Does not own.** The STACK RACE Prompt Architecture or the Source-First Discovery Program's records (both are kept in discovery-records), the separate RACE framework (the RACE repository), or any ≡TACK runtime path.
- **Depends on.** A JavaScript toolchain (Node 22, npm) and the packages in `package.json`. Sign-in uses a broker from the Grok sandbox and is off by default (`VITE_AUTH_ENABLED=false` per `src/lib/auth/use-current-user.ts`).
- **Depended on by.** UNKNOWN. Nothing found in this repository points outward to another ≡TACK repository.
- **Fail behavior.** Not applicable in the ≡TACK sense; nothing here gates an action. A BLOCKED brief is only a message on screen.
- **Verified versus declared.** The completeness rules in `judge.ts` are code and are covered only by whatever the tests below cover (the tests below do not target them). Whether the rules match the RACE architecture document is not checked.

## What is in this repository

| Path | What it is |
|---|---|
| `src/routes/index.tsx` | The single page; renders `RaceDesk` |
| `src/components/race/` | The six views: Desk, Roles, Brief, Ledger, Gates, Audit |
| `src/lib/race/` | `data.ts` (roles, recipes, drill claims), `judge.ts` (completeness rules), `store.ts` (browser state, persisted with zustand) |
| `src/lib/auth/`, `src/lib/app-data/`, `server/`, `migrations/auth/` | Sign-in and connector scaffolding from the App Builder template |
| `scripts/` | Build, preview and migration helpers and their tests |
| `attachments/STACK_RACE_Architecture_v1.0.md` | The architecture document the desk is based on |
| `AGENTS.md`, `.grok/` | The App Builder sandbox's instructions and skills for the tool that generated this app. They describe that tool, not this project. |

## Install and run

Requires Node 22 and npm.

```
npm install --no-package-lock --ignore-scripts   # see "Known issues": npm ci fails
npm run dev                                      # serves on 0.0.0.0:8080
npm run build                                    # also runs npm run db:migrate
npm run typecheck
npm test
```

I did not run `npm run dev` or `npm run build` for this README. The development server and the build were not exercised.

## Testing

- **EXECUTED 2026-11-15 at `9a4dd60`, Node 22.23.4, packages installed with `npm install --no-package-lock --ignore-scripts`:**
  - `node --test 'scripts/**/*.test.mjs'`: 197 tests, 189 passed, 8 failed.
  - `node --experimental-strip-types --test` on the five `src/lib` test files named in `package.json`: 59 tests, 59 passed.
  - `npm run typecheck`: no errors printed.
- Because `npm test` chains the two commands with `&&`, the first command's failures stop it, so `npm test` as written exits non-zero here.
- Not run: lint (`npm run lint`), the build, the browser smoke scripts, the development server.
- No test file targets `src/lib/race/` (the desk's own logic).

## Known issues

These were found while preparing this README and are recorded, not fixed.

1. **The lock file does not match `package.json`.** `npm ci` stops with "lock file's ajv@6.15.0 does not satisfy ajv@8.20.0". A reproducible install is not possible from the committed lock file.
2. **Eight tests in `scripts/grok-pwa-plugin.test.mjs` fail.** They came with the App Builder template. They pass in sample names ("Wild Race", "Hello World") and expect the page's share title to follow them, but the code they exercise also picks up this app's own title, "RACE Desk", from `src/lib/og/site.json`. With the title taken out of a scratch copy of that file, six of the eight pass (EXECUTED 2026-11-18). The other two still fail; the likely cause is this app's own share-card image (INFERRED, not confirmed). "Wild Race" is a sample name in the tests, not an earlier name of this app.
3. **A client secret is committed (owner action).** `src/lib/auth/preview.ts` held a literal OAuth client secret (the constant `PREVIEW_CLIENT_SECRET`) as a fallback for `GROK_AUTH_CLIENT_SECRET`. As of 2026-11-19 the literal is removed from the code and `src/lib/auth/server.ts` reads `GROK_PREVIEW_CLIENT_SECRET` from the environment instead; without either setting, live-preview sign-in is not configured. The old value is still in git history, so rotate it on the broker side and treat it as public (owner action). It is in the only commit, and on 2026-11-18 this repository could be cloned with no access granted, so the value should be treated as public. The file's own comment describes it as the App Builder's shared preview client, accepted only for `*.grok-sandbox.com` addresses and rotated on the vendor's side. That description is REPORTED and was not tested. No other secret-shaped literal was found in the tracked files, and the committed build under `.vercel/output/` does not contain this one (EXECUTED search, 2026-11-18). The 2026-11-15 version of this README said no literal secret was in the working tree. That was wrong. The owner cannot rotate this value alone. The choices are to remove the constant and its fallback (a code change), to make the repository private, or to accept it as a vendor default. The value is not repeated here.
4. **The desk's state is stored in the browser.** There is no server-side record of briefs, drills or the ledger, so nothing a person enters here is a durable or verifiable record.

## Limitations

- Prototype generated by a tool. The rules in `judge.ts` check only that fields are filled in and a few cross-field conditions (for example human approval at high risk); they do not judge the quality of a brief.
- The Ledger and Audit views show what the app keeps in the browser. They are not connected to any ≡TACK ledger.
- Only the paths above were read for this README. `data.ts` (about a thousand lines of roles and drill text) was not read in full.

## License

Apache-2.0, copyright William N. King (see `LICENSE` and `NOTICE`). This is the current state and matches the other repositories in this library. Material under `.grok/skills/` is third-party and keeps its own license files.

## Maintenance

Maintained by one person. Treat it as an unreviewed export until the issues above are resolved.
