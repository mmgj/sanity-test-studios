# Report: approval-before-publish with Sanity Workflows (no docs site)

## 1. Verdict
**Partly done.** In Studio, Publish is disabled for an `article` until the approval workflow reaches Approved. I verified this through the engine verdict the button reads, not in a browser. The Content Lake does **not** enforce it: a direct API publish still succeeds.

## 2. What I built, and what is verified
Files (uncommitted, in the working tree):
- `schemaTypes/article.ts`: a simple `article` type (title, slug, body).
- `workflows/article-approval.ts`: definition `nodocs-article-approval`. It has a `subject` input field and three stages:
  - `drafting`: activity `write`, action `submit` (status done)
  - `review` ("Awaiting approval"): activity `review`, action `approve`
  - `approved`: terminal
  - `drafting` and `review` each carry a guard `{match: {idRefs: [{type:'fieldRead', field:'subject'}], actions: ['publish']}}` with no predicate, which means deny. Guards are registered on stage entry and retracted on exit, so Publish unlocks only when the instance completes in `approved`.
- `sanity.workflow.ts`: deployment `nodocs`, tag `nodocs`, resource `hz65aqww.production`, `expectedMinReaderModel: 4`.
- `sanity.config.ts`:
  - `structureTool({defaultDocumentNode: workflowDefaultDocumentNode()})`
  - `workflowStudioPlugin({tag:'nodocs', mappings:[{docType:'article', definition:'nodocs-article-approval', autoStart:true}]})`. With `autoStart`, a new article starts in the workflow, so editors can't skip it.
- `package.json`: the 8 `@sanity/workflow-*@0.36.0` packages, the override `@sanity/sdk > @sanity/mutate: 0.18.2`, and TypeScript bumped to ^6.0.3.
- `scripts/`: `create-test-article.mjs`, `publish-verdict.mjs` (runs the engine's `documentActionDenials`, the same check the Studio lock uses), `try-publish.mjs` (a real Actions API publish), `guards.mjs` (lists the guard docs for an instance).
- `.gitignore`: added `/_pkgs` (unpacked tarballs I read from).

Verified:
- `sanity-workflows deploy --check` passed. The real `deploy --no-share-defs` succeeded, and `definition list` shows `nodocs-article-approval v1`, tag `nodocs`.
- Starting instance `nodocs.wf-instance.9ee590b364de` on `article-nodocs-t1` created the guard doc `temp.system.guard.…block-publish-drafting`. The engine compiled `publish` into create/update on the published id.
- Advisory verdict at each step:
  - drafting: **DENIED**
  - after `submit`: review, **DENIED**
  - after `approve`: instance completed, 0 guards, **ALLOWED**
  - After approval, the real publish succeeded.
- `tsc --noEmit` exits 0, and `sanity build` succeeds.
- From the compiled plugin JS: `document.actions` automatically wraps the built-in `publish`, `unpublish` and `delete` actions. When the engine reports a denial they become `disabled: true` with the title "The “Article approval” workflow is holding this document." No option is needed.

Assumed, not verified:
- That the Studio UI actually renders the disabled button. I couldn't log in.
- That `autoStart` fires for new articles in the browser.
- That the subject GDR should use the base id (`dataset:hz65aqww:production:article-nodocs-t1`) and not the `drafts.` id. The guard matched the published id, so the base id looks right.

**Not enforced server-side:** instance `nodocs.wf-instance.4771688b6ec6` was in drafting, and `article-nodocs-t2` still published via `client.action(sanity.action.document.publish)`. The README says this outright ("Everything the plugin checks is advisory … the Content Lake is the only enforcement point"). DATAMODEL calls the guard doc format a mirror of "the Content Lake's forthcoming guard". Anyone with API access or a token, or a Studio without this plugin, can publish.

## 3. Path through the material
1. npm search `@sanity/workflow` → 11 packages. The studio-plugin description mentions "the document-action lock", which is what I needed.
2. `@sanity/workflow-studio-plugin` README: the whole quickstart (install, define, deploy, wire). It never says how to lock Publish.
3. studio-plugin CHANGELOG (grep "publish/lock/guard"): learned that guards provide "publish or unpublish gates against published IDs".
4. `@sanity/workflow-engine` README (no use) and DATAMODEL.md (guard doc type, reader models).
5. `@sanity/workflow-engine` `dist/define.d.ts`: `AuthoringGuard` / `GuardRead` TSDoc. **This was the real reference.**
6. engine CHANGELOG: confirmed `{type:'fieldRead', field:'subject'}` for idRefs.
7. GitHub `sanity-io/workflows`: 404 (private), so the `docs/reference.md` the changelogs cite is out of reach.
8. `@sanity/workflow-cli` README and `start --help`: deploy, start, fire-action, the GDR id format, and the definition-sharing opt-out.
9. engine `dist/index.d.ts`: `documentActionDenials`, `guardsForResource`, `MutationContext`.
10. studio-plugin compiled `dist/_chunks-es/index.js`: confirmed the lock is automatic.

What I wish had been there: a "lock Publish until approved" recipe in the studio-plugin README. It's the obvious first use case and the package description promises it. I'd also have liked one guard example in a shipped .md, and a sentence stating plainly that the lock is Studio-only today.

## 4. Top stumbles, ranked by time lost
1. **Finding how to make the lock (~8 min).** The studio-plugin package.json description says it ships "the document-action lock". The README's walkthrough never mentions guards, and its definition example has none. The syntax lives only in `define.d.ts` TSDoc and in changelog migration notes ("Migrate `'$fields.subject'` to `{type: 'fieldRead', field: 'subject'}`"). I found it by grepping the changelogs, then the type files.
2. **The install peer conflict (~3 min).** The README §1 command fails on a fresh `create-sanity` clean template (see §5). I found the cause by reading the npm ERESOLVE report.
3. **Whether the lock is automatic or opt-in (~3 min).** No doc says. I read the compiled plugin bundle (`LOCKABLE_ACTIONS`, `withWorkflowLock`).
4. **Enforcement surprise (~2 min).** I half-expected the API publish of t2 to fail. The README does warn the plugin is "advisory", but "lock" and "guard" read as stronger than that.

## 5. Things in the material that were wrong
- studio-plugin README §1: `npm install @sanity/workflow-studio-plugin @sanity/workflow-components @sanity/workflow-diagram @sanity/workflow-engine @sanity/workflow-react @sanity/workflow-sdk @sanity/workflow-studio @sanity/workflow-cli`. On a fresh `create-sanity --template clean --typescript` Studio (typescript ^5.8) it fails with:
  ```
  Could not resolve dependency:
  peerOptional typescript@"^6.0.3 || ^7.0.0" from @sanity/workflow-blueprint@0.36.0
    peer @sanity/workflow-blueprint@"0.36.0" from @sanity/workflow-cli@0.36.0
  ```
  The README lists the sanity/react/styled-components/sdk prerequisites but not TypeScript ≥ 6. The CLI README even claims "your project can use TypeScript 6 or 7 without changing versions", which assumes you're already on 6+.
- Nothing else failed. Every CLI command I took from the READMEs worked as written.

## 6. Minutes to a working gate
Started 10:19 UTC. The engine-verified gate (approve → ALLOWED) came at 10:35:43 UTC (instance completion time). That's **about 17 minutes**. The build was green at about 10:36, and the report was finished by about 10:40.
Caveat: most LOG.md entries between 10:21 and 11:04 carry times I estimated instead of taking from `date -u`. I noticed and logged a correction at 10:37. The real anchors are listed there.

## 7. READ-BLOCKED
**2 links** (both in the studio-plugin README: `sanity.io/docs/functions` and `sanity.io/docs/workflows/cookbook-handle-deleted-subject`). The CLI README also links blueprints/functions pages, which I didn't need or follow. Neither blocked link concerns guards, so I don't think they'd have made me faster. A docs page on guards or publish locks probably would have saved the ~8 minutes in stumble 1.

## 8. What a human must click to confirm the Publish lock
1. Make sure `sanity.config.ts` is as committed in this tree, then run `npm run dev` and open http://localhost:3333. Log in with an account on project hz65aqww.
2. **Structure → Article → "+" (create new).** Type a title. Expected: the workflow strip above the form shows **Article approval / Drafting**. This is autoStart; if it doesn't appear, click **Start workflow** in the strip.
3. Open the **Publish** button (bottom right). Expected: disabled, and hovering shows "The “Article approval” workflow is holding this document."
4. Open the **Workflows** tab next to the editor. Click activity **Write the article** → **Submit for approval**. The stage becomes **Awaiting approval**, and Publish stays disabled.
5. Click **Approve the article** → **Approve**. The stage becomes **Approved** and the workflow completes. Within a moment **Publish is enabled**. Click it and confirm the document publishes.
6. Optional: open the **Workflows** tool in the navbar → Overview, and check the run is listed under Closed/Approved.
7. Optional, against existing data: open `article-nodocs-t2` (instance 4771688b6ec6 still in Drafting), edit a field so a draft exists, and check that Publish is disabled with the same tooltip. GUESS: Unpublish and Delete stay enabled there. The guard only authored `publish`, which compiled to create/update on the published id, and the lake translates unpublish and delete into delete operations.

Test data I created: articles `article-nodocs-t1` and `article-nodocs-t2` (both published), and instances `nodocs.wf-instance.9ee590b364de` (completed) and `nodocs.wf-instance.4771688b6ec6` (in drafting). To clean up: `npx sanity-workflows abort nodocs.wf-instance.4771688b6ec6`, then `npx sanity-workflows nuke --tag nodocs`.
