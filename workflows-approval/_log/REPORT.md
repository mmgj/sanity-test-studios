# Report: "an editor has to get approval before a document is published"

## 1. Verdict

**Mostly done.** An `article-approval` workflow is deployed to hz65aqww/production. It holds Publish on the article until an approver fires **Approve**. I verified this end to end with the CLI and the engine's own guard evaluator. The Studio UI (Publish button disabled) is wired, typechecks and builds, but has not been seen in a browser. The hold is **advisory**: the Studio plugin and the engine honor it, but a raw API write with a token is not blocked (documented, and I reproduced it).

## 2. What was built

| File | Purpose |
| --- | --- |
| `workflows/article-approval.ts` | Workflow definition |
| `sanity.workflow.ts` | Deployment config: name/tag `production`, resource `hz65aqww.production`, `expectedMinReaderModel: 10` |
| `sanity.config.ts` | `workflowStudioPlugin({tag: 'production', mappings: [{docType: 'article', definition: 'article-approval', autoStart: true}]})` + `structureTool({defaultDocumentNode: workflowDefaultDocumentNode()})` |
| `schemaTypes/article.ts` | Simple `article` type (title, slug, body) |
| `package.json` | Studio 6.17, all `@sanity/workflow-*` pinned at 0.36.0, `@sanity/sdk` 3.7.0, TypeScript 6.0.3, `overrides` for `@sanity/mutate` 0.18.2 |
| `scripts/create-test-article.mjs` | Creates or replaces a published test article |
| `scripts/check-publish-gate.mjs` | Loads the live `temp.system.guard` docs and calls the engine's `documentActionDenials` to ask "would publishing this article be denied right now?" |
| `scripts/list-guards.mjs` | Dumps the engine document types and guard docs |
| `scripts/raw-publish-attempt.mjs` | Demonstrates that a direct token write bypasses the guard |

### The workflow

```
drafting ──submit──▶ in-review ──approve──▶ approved (terminal)
   ▲                    │
   └──request-changes───┘   (reason required)
```

- `subject` is a required input of type `article`. With `autoStart: true` in Studio, every new article starts an instance automatically.
- **How approval gates publish:** both `drafting` and `in-review` declare a guard:
  `{name: 'hold-publish-<stage>', match: {idRefs: [{type: 'fieldRead', field: 'subject'}], actions: ['publish']}}` with no predicate, which is an unconditional deny. On stage entry the engine writes a `temp.system.guard` document. The Studio plugin reads it and disables Publish. Entering `approved` (which has no guard) deletes the guard document, and Publish becomes available.
- `approve` records the approver in `approvedBy` (actor), and the transition fires on `defined($fields.approvedBy)`. `request-changes` stores the reason and loops back. An engine-fired `clear-changes` (`when: 'true'`) clears the old reason when the article re-enters review.

### Verified vs assumed

**Verified (CLI/scripts against the real dataset, instance `production.wf-instance.fba13f3e142f`):**
- `deploy --check`, `--dry-run` and `deploy` succeed (`article-approval v1` created).
- `start` puts the instance in `drafting`, and the guard doc `temp.system.guard.production.wf-instance.fba13f3e142f.hold-publish-drafting` exists. The engine evaluator says **PUBLISH DENIED**.
- `submit` → `in-review`: the guard moves to `hold-publish-in-review`, still DENIED.
- `request-changes` → back to `drafting` (DENIED). Resubmit → `in-review` without bouncing back (DENIED).
- `approve` → `approved`, instance completed, no guard docs left. **PUBLISH ALLOWED**.
- `npx tsc --noEmit` passes and `npx sanity build` succeeds with the plugin.
- A direct `client.patch(publishedId)` with the editor token **succeeds** while the guard is active. Guards are not enforced by the Content Lake, as documented.

**Assumed, not verified:**
- That the Studio plugin actually disables the Publish button for `article-wf-test-2` (the docs say it does; I can't log in).
- That `autoStart` starts the workflow when an article is created in Studio.
- Who may approve: **anyone** with Studio access who can fire actions. I didn't add role gating (`roles` on the action is documented as "advisory"). For a real team, gate `approve` on a role or on an assigned reviewer (see the cookbook's `claim` + `$fields.reviewer.id == $actor.id`).
- Production robustness: no Functions runtime is deployed. This workflow has no effects or clock-based transitions, and the cookbook says that's fine ("the whole runtime is the Studio plus the deployed definition").

## 3. Path through the docs

1. https://www.sanity.io/docs/workflows: the hub. It pointed me straight at Guards and the editorial-review cookbook.
2. https://www.sanity.io/docs/workflows/getting-started: install, define, deploy, start, fire-action.
3. https://www.sanity.io/docs/workflows/guards: **the key page**, with the `actions: ['publish']` guard snippet.
4. https://www.sanity.io/docs/workflows/studio-plugin: plugin install, the override, the mapping and `autoStart`.
5. https://www.sanity.io/docs/workflows/cookbook-editorial-review: approve/reject loop and the entry trigger.
6. https://www.sanity.io/docs/workflows/studio-user-guide ("Understand a held publish").
7. https://www.sanity.io/docs/workflows/deploy-definitions: blueprint peer, definition sharing.
8. https://www.sanity.io/docs/workflows/upgrade + /release-notes: while fighting ERESOLVE.
9. https://www.sanity.io/docs/workflows/activities-and-actions, /conditions: `roles`, `$actor`.
10. https://www.sanity.io/docs/workflows/cli-reference: `start --field`, `fire-action --param`.
11. Type definitions: `@sanity/workflow-engine/dist/define.d.ts` (guard schema), `dist/index.d.ts` (`documentActionDenials`).

**Where I'd have liked to land:** one "Require approval before publishing" recipe: the editorial-review cookbook *with* the guard included, the Studio plugin config, and a working install command for a fresh `npm create sanity` Studio. Today the cookbook ends with "Add a publishing hold: declare a guard … See Guards", so you have to put the three pages together yourself.

## 4. Top stumbles (by time lost)

1. **npm ERESOLVE on the documented plugin install (~3 min).**
   Docs (https://www.sanity.io/docs/workflows/studio-plugin): `npm install @sanity/sdk@^3.1 @sanity/workflow-studio-plugin … @sanity/workflow-cli`.
   Actual: on a fresh Studio with `sanity@6.17.0`, `@sanity/cli@8.13.0` already depends on `@sanity/workflow-cli@0.32.0` + `@sanity/workflow-engine@0.32.0`. The unpinned install picks 0.36.0 and fails: `Found: @sanity/workflow-cli@0.32.0 … from @sanity/cli@8.13.0 … Conflicting peer dependency: @sanity/workflow-engine@0.36.0`. Fix: pin every package explicitly `@0.36.0`. The nested 0.32 copy inside `@sanity/cli` stays. I found this by reading the npm resolution report.
2. **TypeScript peer conflict from `@sanity/workflow-blueprint` (~2 min).**
   Docs (https://www.sanity.io/docs/workflows/deploy-definitions): "Install the engine and Blueprint packages alongside the CLI. The CLI declares both as exact peers."
   Actual: blueprint 0.36.0 has `peerOptional typescript@"^6.0.3 || ^7.0.0"`, and the `clean` template ships `typescript ^5.8` → `Conflicting peer dependency: typescript@7.0.2`. No page states a TypeScript requirement. Fix: `npm i -D typescript@^6`. Also, the studio-plugin install list leaves out blueprint, even though the CLI requires it as a peer.
3. **Duplicate guard name (~1 min).** I reused one guard object on two stages: `stages[1].guards[0].name: duplicate guard name (the guard lake _id derives from it — unique per definition)`. The reference says "unique within the definition", but every example shows a single stage. A "hold publish across several stages" example would help.
4. **Guard doc type and how to verify the hold without Studio (~2 min).** The guards page shows `compileGuards`/`documentActionDenials` in memory, but never names the stored `_type` (`temp.system.guard`) or shows how to check a live hold. I found the type by GROQ and built `check-publish-gate.mjs` from the `.d.ts`.

## 5. Docs that were wrong or failed

- **studio-plugin install command fails** on a fresh `npm create sanity@latest` Studio (sanity 6.17.0):
  > `npm install @sanity/sdk@^3.1 @sanity/workflow-studio-plugin @sanity/workflow-components @sanity/workflow-diagram @sanity/workflow-engine @sanity/workflow-react @sanity/workflow-sdk @sanity/workflow-studio @sanity/workflow-cli`

  Error: `npm error Found: @sanity/workflow-cli@0.32.0 … @sanity/workflow-cli@"0.32.0" from @sanity/cli@8.13.0 … Could not resolve dependency: @sanity/workflow-cli@"*" from the root project … Conflicting peer dependency: @sanity/workflow-engine@0.36.0`
- **deploy-definitions blueprint install** fails with the default template's TypeScript 5:
  > `npm install --save-dev --save-exact @sanity/workflow-cli @sanity/workflow-engine @sanity/workflow-blueprint`

  Error (the equivalent install I ran): `While resolving: @sanity/workflow-blueprint@0.36.0 Found: typescript@5.9.3 … Conflicting peer dependency: typescript@7.0.2 … peerOptional typescript@"^6.0.3 || ^7.0.0" from @sanity/workflow-blueprint@0.36.0`
- **Inconsistency:** the Quick start installs only `@sanity/workflow-engine @sanity/workflow-cli`, while deploy-definitions says blueprint is a required exact peer. Not wrong as such, but a quick-start install on npm will hit the peer check.
- Everything else I ran (deploy `--check`/`--dry-run`, `start --field`, `fire-action` with and without `--action`, `--param`, `show`, the guard snippet, and the plugin config) worked exactly as documented.

## 6. Time

Start 09:19 UTC → approval gate verified by CLI at **09:38** → **~19 minutes**. The report was finished at ~09:41.

## 7. What a human must click in Studio to confirm the Publish lock

Run `npm run dev` (or `npx sanity deploy`) and log in to Studio for project hz65aqww / production.

**A. Existing locked article (instance `production.wf-instance.3f5fd8803e6d`, stage Drafting):**
1. Go to **Structure → Article → "Workflow approval test article"** (`article-wf-test-2`).
2. Confirm the **workflow strip** above the form shows *Article approval* at stage *Drafting*.
3. Edit the title so a draft exists, then open the document actions (the **Publish** button and the ▾ menu).
   **Expected:** Publish is **disabled**, and its tooltip/message names the *Article approval* workflow. Unpublish and Delete stay enabled because the guard covers only `publish`.
4. Open the **Workflows** view tab on the document and click **Submit for approval**.
   **Expected:** stage *Awaiting approval*, Publish still disabled.
5. Click **Request changes**, enter a reason. **Expected:** back to *Drafting*, still disabled. Submit again.
6. Click **Approve**. **Expected:** stage *Approved*, and **Publish becomes enabled**. Click it to publish.

**B. Auto-start on new documents:**
1. **Structure → Article → Create new (+)**.
2. **Expected:** an *Article approval* instance starts automatically (the strip shows *Drafting*), and Publish is disabled until steps A4–A6 are done.

If the strip shows nothing, check the **Workflows** tool → *Article approval* → **Setup issue**, or the browser console for `[workflow-studio-plugin]` messages (per the studio-plugin page).

### Caveats a lead should know
- **Not a hard lock.** Any API token with write access can still publish directly (verified with `scripts/raw-publish-attempt.mjs`). For a hard rule, restrict publish rights with dataset access control/roles (the docs say this too).
- **Anyone can approve** in this version, including the author. Add role gating or reviewer assignment before relying on it.
- Articles created **outside Studio**, or existing before this setup, have no instance and therefore no hold. Start one with `npx sanity-workflows start article-approval --deployment production --field subject='{"id":"dataset:hz65aqww:production:<id>","type":"article"}'`.
- Test data left in the dataset: `article-wf-test-1` (completed instance), `article-wf-test-2` (instance in drafting, title changed by the raw-write test).
