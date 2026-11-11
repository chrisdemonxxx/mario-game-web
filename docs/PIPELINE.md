# Autonomous Pipeline Contract v2

This repository is built by a team of bots (Architect → Builder → QA → Reviewer → Shipper → Sentinel, coordinated by Chief). **GitHub state is the single source of truth.** Messages between bots are only wake-up calls; every bot re-reads GitHub before acting.

## Labels
`foundation`, `feature`, `qa-passed`, `qa-failed`, `approved`, `changes-requested`, `deployed`, `incident`, `blocked`

## Stages

| Stage | Owner | Trigger | Done when (verifiable on GitHub) | Notify (message_bot, 1 line) |
|---|---|---|---|---|
| Spec | Architect | user request / `incident` issue | Issues with acceptance criteria, label `feature` or `foundation`, `Depends on #N` where needed | Builder |
| Build | Builder | open issue without PR, or PR labelled `qa-failed` / `changes-requested` | PR from `feature/issue-N-*` with `Closes #N`; CI check `lint-and-test` green on head; commits visible via GitHub API | QA |
| Verify | QA | PR head SHA has no `QA:` comment yet | Exactly one comment per SHA: `QA: PASSED sha=<7>` or `QA: FAILED sha=<7>` + label swap | Reviewer (pass) / Builder (fail) |
| Review | Reviewer | PR labelled `qa-passed` and CI green on current head | `REVIEW: APPROVED sha=<7>` + label `approved`, or `REVIEW: CHANGES REQUESTED sha=<7>` + label `changes-requested` | Shipper / Builder |
| Ship | Shipper | PR labelled `approved`, CI green, head SHA == approved SHA | Squash-merged via GitHub API, branch deleted, Railway deploy SUCCESS, label `deployed`, production URL written to the Space registry and `shared/memory/production_urls.json` | Sentinel (URL), Chief |
| Watch | Sentinel | routine tick; registry row has a production URL | `GET {url}/health` returns 200 within 2 s. Silent when healthy. Incident → one issue labelled `incident` | Architect + Chief (open / resolved only) |

## Rules
1. **Verify before you claim.** Never say pushed / opened / merged / deployed until re-read from GitHub or Railway. If a write failed, report the exact error text.
2. **Writes go through the connected GitHub app tools** (`GITHUB_COMMIT_MULTIPLE_FILES`, `GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS`, `GITHUB_CREATE_A_PULL_REQUEST`, `GITHUB_MERGE_A_PULL_REQUEST`, label and comment tools). Local `git push` with the shared PAT returns 403 — do not depend on it. Cloning and running tests locally is fine.
3. **One GitHub account.** All bots act as the repo owner, so a formal PR approval review is impossible. Approval = `REVIEW: APPROVED` comment + `approved` label. Branch protection on `main` requires the `lint-and-test` check and is enforced for admins; a red PR cannot be merged by anyone.
4. **Foundation first.** The first merge in any project is the foundation: Jest + ESLint (jest env for `tests/`), `.github/workflows/ci.yml` with a job named `lint-and-test`, zero-dependency `server.js` exposing `GET /health`, `npm start`, smoke tests. Feature branches rebase onto `main` and never add their own Jest/ESLint config.
5. **WIP limit.** Builder keeps at most 2 feature PRs open (fix pushes to existing PRs excepted). Order: `foundation` → issues with no `Depends on` → the rest.
6. **One comment per SHA.** QA and Reviewer never re-comment on a SHA they already judged. No "still waiting" comments.
7. **Idempotent routines.** Each run: read registry → read GitHub → act only on what changed → stop. Never message to acknowledge; never message when nothing changed.
8. **Report to Chief only** on: a blocker needing a decision; PR opened; fixes pushed; `QA: PASSED`; `REVIEW: APPROVED`; merged; deployed (with URL); incident opened / resolved. One to three lines with links.
9. **Conflicts:** GitHub state > Space memory > newest-timestamped message > older messages.
10. **Secrets:** never print tokens. Missing credential → label `blocked`, comment what is needed, message Chief once.

## Test standard
`npm install && npm run lint && npm test` from the repo root on the PR head (this is what CI runs). Tests live in `tests/**/*.test.js`. Browser scripts export for Jest with:
```js
if (typeof module !== 'undefined' && module.exports) { module.exports = { MyClass }; }
```
Lint errors are a hard fail. Coverage ≥ 60 % lines for new modules is the soft target.

## New-project kickoff (Architect)
1. Add a row to the Space memory project registry.
2. Create the labels above.
3. Open the `foundation` issue (copy the harness from this repo's `main`).
4. After the foundation merges: branch protection on the default branch — required check `lint-and-test`, `enforce_admins: true`.
5. Create feature issues with acceptance criteria and `Depends on #N`.
6. Confirm the Railway project exists and is linked to the default branch; otherwise open a `blocked` issue naming what is needed and message Chief.
7. `message_bot` Builder with the issue list.

## Monitoring and Alerting (Sentinel / Chief)

The pipeline health is monitored automatically by Sentinel every 30 minutes (or on CI trigger). The monitoring detects queue age and blocked items, generating alerts when thresholds are exceeded.

### Queue States Monitored
- **QA Pending**: Feature PRs with no QA comment yet (`feature` label, no `qa-passed`/`qa-failed`)
- **QA Failed**: PRs with `qa-failed` label (needs builder fix)
- **Changes Requested**: PRs with `changes-requested` label (needs builder action)
- **Approved Not Merged**: PRs with `approved` label but `merged_at` is null (ready to ship)
- **Blocked Issues**: Issues with `blocked` label (awaiting external action)

### Alert Thresholds
- **Green** (✅): Age < 24 hours — no action needed
- **Yellow** (⚠️): Age 24–48 hours — monitor closely
- **Red** (🔴): Age > 48 hours — escalate to Chief

### Alert Content
Each alert includes:
- Item type (PR # or Issue #) with link
- Title
- Age in hours
- Current status (QA Failed, Changes Requested, etc.)
- Evidence (timestamps, last relevant comment, reason)
- Alert level (green/yellow/red)

### Sentinel Routine
Sentinel runs the following steps each check:
1. Fetch all open PRs and comments via `GITHUB_LIST_PULL_REQUESTS` (paginated, per_page=100)
2. Fetch all open issues and comments via `GITHUB_LIST_REPOSITORY_ISSUES` (paginated, per_page=100)
3. Call `getQueueHealthSummary()` to compile queue state with thresholds
4. If any red-level items found (> 48h old):
   - Message Chief: `{red_count} items blocked 48h+ (e.g., #22 qa-failed, #24 changes-requested): {links}`
5. Create or update a monitoring issue (e.g., `#999 Pipeline Queue Health`) with a table:
   ```
   | Item | Age | Status | Link | Level |
   |---|---|---|---|---|
   | #22 | 52h | QA Failed | [link] | 🔴 |
   | #24 | 36h | Changes Requested | [link] | ⚠️ |
   ```
6. Comment reasons for blocked items (if `Blocked:` label present, include reason from last comment)

### Idempotent Alerting
- Sentinel never creates duplicate alert issues; it updates the existing monitoring issue with latest data
- Sentinel does not re-message Chief if alert state hasn't changed (same items with same ages)
- Silent when all items are green (✅)

### Integration with Builder / Blocker Workflow
When an item is labeled `blocked`:
1. The most recent comment should start with `Blocked:` and explain the reason
   - Example: `Blocked: Waiting for QA (qa-failed since 36h ago)` or `Blocked: Waiting for Railway project setup`
2. Sentinel includes this reason text in alerts and monitoring issues
3. If the blocking reason is cleared (e.g., QA passes), Builder or responsible actor removes the `blocked` label
