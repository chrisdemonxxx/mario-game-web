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

## SHA-Bound Labels: Approval State Tied to Code

When a PR is approved, the approval is only valid for the exact code (commit SHA) that was reviewed. If the developer pushes new commits, the approval becomes **stale** and must be renewed.

### State Transitions

1. **Fresh:** Reviewer has posted `REVIEW: APPROVED sha=<7>` comment, and the PR head SHA matches that `<7>`.
   - Shipper can merge; approval is current.

2. **Stale:** When the PR head SHA differs from the label's SHA, the label is stale.
   - Developer pushes new commits → head SHA changes → old labels no longer represent current state

3. **Removed:** Before posting a new status comment, the bot must remove stale labels.
   - QA removes both `qa-passed` and `qa-failed` (if present) before posting a new QA comment
   - Reviewer removes both `approved` and `changes-requested` (if present) when head SHA has changed since the last REVIEW comment

### Implementation Rules

**QA Stage:**
- Before posting a new QA comment (on any SHA), check and remove both `qa-passed` and `qa-failed` labels if present
- Post `QA: PASSED sha=<7>` or `QA: FAILED sha=<7>` with the new SHA
- Apply corresponding label

**Reviewer Stage:**
- Before posting a new REVIEW comment, extract the SHA from the most recent `REVIEW: APPROVED` comment (if one exists)
- Compare it to the current PR head SHA
- If they differ: remove both `approved` and `changes-requested` labels
- Post `REVIEW: APPROVED sha=<7>` or `REVIEW: CHANGES REQUESTED sha=<7>` with current head SHA
- Apply corresponding label

**Shipper Stage:**
- Before merging, extract the SHA from the most recent `REVIEW: APPROVED sha=<7>` comment
- Compare it to the current PR head SHA
- If they match: proceed with merge (PR is approved for current code)
- If they differ: do not merge; notify Builder that the approval is stale and Reviewer re-approval is needed

### Shared Utility Module

`src/sha-bound-labels.js` provides reusable functions for SHA extraction, comparison, and label management:
- `extractShaFromComment(commentBody, pattern)` - Extract SHA from bot comments
- `compareShas(sha1, sha2)` - Compare SHAs (first 7 chars)
- `findLatestCommentWithPattern(comments, pattern)` - Find most recent matching comment
- `shouldRemoveLabelsForSha(currentHeadSha, comments, statusPattern)` - Determine if labels are stale
- `getQaLabelsToRemove(currentLabels)` - Get QA labels to remove
- `getReviewerLabelsToRemove(currentLabels)` - Get Reviewer labels to remove
- `formatStatusComment(statusType, result, sha, details)` - Format bot comments with SHA

### Example Scenario

1. Developer opens PR on `abc1234`, QA passes → label `qa-passed`, comment `QA: PASSED sha=abc1234`
2. Reviewer approves → label `approved`, comment `REVIEW: APPROVED sha=abc1234`
3. Developer rebases on new main → PR head becomes `def5678`
4. Shipper checks: `approved` label exists, but `def5678` ≠ `abc1234` → **refuses merge**, notifies Builder
5. Builder rebases, pushes `def5678`, alerts QA
6. QA removes `qa-passed` label, tests new SHA, posts `QA: PASSED sha=def5678`, re-applies label
7. Reviewer removes `approved` label, re-checks, posts `REVIEW: APPROVED sha=def5678`, re-applies label
8. Shipper now sees `approved` label + matching SHA → merges

This prevents merging code that hasn't been tested or approved under its current state.

## Conflict Resolution

### Overview
When feature PRs conflict with main (during rebase or merge), the pipeline must handle conflicts safely without losing code changes or bypassing CI. This section defines the strategy for detecting, resolving, and verifying conflicts.

### When Conflicts Occur

Conflicts can happen in these scenarios:
1. **Rebase conflicts**: A feature branch rebases onto updated main, and files overlap
2. **Merge conflicts**: main has changed files that the PR also modifies
3. **Post-rebase test failures**: Code compiles but lint/test fails after rebase (logic conflict)

### Detection Rules

**Builder detects conflicts via:**
1. Local `git rebase` fails with merge conflict markers in files
2. Local test run fails after a rebase (e.g., `npm run lint` or `npm test` errors after rebase)
3. Shipper reports CI red on merge commit
4. Manual review of git status and uncommitted changes during rebase

**Communication protocol:**
- Builder comments on PR: "Rebased with conflicts, resolved in <files>; re-testing..."
- Include list of affected files and conflict resolution strategy
- Never silently merge over conflicts; always document the resolution

### Preservation Strategy

**Three-way merge approach:**
1. Before rebasing, identify overlapping files via `git diff main..HEAD --name-only`
2. Use `git rebase --onto main` to reapply commits on updated main
3. For each conflict:
   - Read both versions (main's and feature's)
   - Preserve feature logic; merge main's changes
   - Run lint/test locally to verify no code was lost
   - Document the resolution in commit message: "Resolved conflict in <file>: kept feature logic X, merged main change Y"

**Prevention via commit messages:**
- Include the feature's intent in commit messages (e.g., "Add player jump"), not just file changes
- This helps conflict resolution: resolvers can use intent to guide decisions
- Example: "feat: Add player jump mechanics" > "Update player.js"

### Builder Workflow (Rebase & Conflict Resolution)

**When a PR is behind main and needs rebase:**

1. **Check current branch state:**
   ```
   git fetch origin
   git status
   ```

2. **If branch has no conflicts:**
   - Use `GITHUB_COMMIT_MULTIPLE_FILES` with `base_branch: main` to rebase onto main
   - Verify changes after rebase: `npm install && npm run lint && npm test`
   - Comment on PR: "Rebased onto main; all checks pass."

3. **If conflicts are detected (git rebase fails or post-rebase tests fail):**
   - Resolve conflicts locally: edit files to merge changes
   - Run full test suite: `npm install && npm run lint && npm test`
   - Only push after all local tests pass
   - Commit with message: "Resolve conflicts from rebase onto main: <files>"
   - Comment on PR: "Rebased with conflicts, resolved in: src/player.js, src/game.js. Tests passing locally (sha=<7>). Re-testing..."
   - Push commit and wait for CI

4. **After push, wait for CI:**
   - If CI passes, the conflict resolution is verified
   - If CI fails, repeat conflict resolution steps
   - Do not merge until CI is green

### Shipper Merge Logic (Conflict Detection & Verification)

**Before merging, Shipper must verify:**

1. **No uncommitted changes in merge state:**
   ```
   git status → must be "clean" (no merge conflicts, no unresolved markers)
   ```

2. **CI is green:**
   - Check `lint-and-test` job status; abort if red

3. **Approved SHA matches current head:**
   - Extract SHA from latest `REVIEW: APPROVED sha=<7>` comment
   - Compare to PR head SHA
   - If mismatch: abort merge, notify Builder (approval is stale)

4. **No conflict markers in final code:**
   - If any `<<<<<<<`, `=======`, `>>>>>>>` markers are found in committed code, abort merge
   - Comment: "Merge aborted: conflict markers found in <file>. Builder must resolve manually."

5. **Merge commit succeeds:**
   - After merge, verify the merge commit in CI
   - If CI red on merge commit: rollback (revert) and notify Chief

### Examples

**Example 1: Successful conflict resolution**
```
1. Developer opens PR with feature/issue-X-new-feature on player.js
2. Main is updated with different player.js changes
3. Builder rebases onto main → conflict in player.js
4. Builder resolves: keeps feature logic, merges main's safety improvements
5. Builder runs: npm run lint && npm test → PASS
6. Builder pushes and comments: "Rebased with conflicts in player.js (kept jump logic, added health check from main)"
7. CI passes on new SHA
8. QA removes stale qa-passed, tests new SHA, re-applies qa-passed
9. Reviewer re-approves with new SHA
10. Shipper merges (SHA matches, CI green)
```

**Example 2: Conflict resolution fails (post-rebase test failure)**
```
1. Builder rebases onto main
2. No git conflicts, but tests fail: "TypeError: player.jump is not a function"
3. Cause: main changed jump signature but feature code still uses old signature
4. Builder investigates, fixes the call site
5. Builder runs tests again → PASS
6. Builder commits: "Resolve conflict: update jump call signature after main's refactor"
7. Builder pushes and repeats QA/Review/Ship steps
```

### Acceptance Criteria (Issue #26)

- [x] docs/PIPELINE.md has a "Conflict Resolution" section with 5+ rules (detection, preservation, builder workflow, shipper logic, examples)
- [x] Conflict handling is not bypassed; conflicts are always resolved and tested locally before push
- [x] Builder workflow includes rebase, conflict resolution, local testing, and push steps
- [x] Shipper detects and refuses to merge if conflicts are unresolved or CI is red
- [x] Feature code is preserved during conflict resolution (via three-way merge and verification)
- [x] All rules are verifiable: Builder can rebase a PR with conflicts, document resolution, and push clean code; Shipper can verify and refuse merge if needed

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
