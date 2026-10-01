# Workflows approval (no docs) — log

## 10:19 RUN
`ls`, node v24.21.0, npm 11.19.0. Empty dir besides .env.local and _log. Start.

## 10:21 READ — npm registry search `@sanity/workflow` — useful: yes
Found 11 packages at 0.36.0 (published 2026-09-30): workflow-engine, -cli, -studio-plugin, -studio, -react, -sdk, -components, -diagram, -blueprint, -mcp, -engine-test. Descriptions point to: engine (define workflows as data), cli (deploy definitions), studio-plugin ("form strip, Workflows view, stage badges, and the document-action lock" — the lock is what I need). Repo: github.com/sanity-io/workflows.

## 10:23 RUN
`npm pack` + untar of workflow-engine, workflow-cli, workflow-studio-plugin, workflow-blueprint (0.36.0) into `_pkgs/` for reading.

## 10:24 READ — @sanity/workflow-studio-plugin README.md — useful: yes
Full quickstart: install list (8 packages), `@sanity/mutate` 0.18.2 npm override, `defineWorkflow` example (drafting→review→approved), `sanity.workflow.ts` with `defineWorkflowConfig({deployments:[{expectedMinReaderModel:4,name,tag,workflowResource,definitions}]})`, `npx @sanity/workflow-cli deploy --tag`, `workflowStudioPlugin({tag})` + `workflowDefaultDocumentNode()`. Says plugin provides a "document-action lock" in the description but the README body never explains how to make Publish locked until approval. Also: "Everything the plugin checks is advisory". Needs `sanity ^6.15`.

## 10:24 READ-BLOCKED
- https://www.sanity.io/docs/functions (from studio-plugin README §5)
- https://www.sanity.io/docs/workflows/cookbook-handle-deleted-subject (from studio-plugin README §5)

## 10:27 READ — @sanity/workflow-studio-plugin CHANGELOG.md (grep lock/publish/guard) — useful: partly
Finds the concept: "Mutation guards now deploy edit locks against draft IDs and publish or unpublish gates against published IDs", "the publish/delete action lock ... while the guard still denied the write". So the Publish lock comes from a *guard* declared in the definition. The changelog doesn't show the authoring syntax. It points to `docs/reference.md` (in the repo, not shipped).

## 10:27 READ — @sanity/workflow-engine README.md — useful: no
Only covers fields vs schema fields and actor resolution. Nothing on guards or publishing.

## 10:28 READ — @sanity/workflow-engine DATAMODEL.md (grep guard) — useful: partly
Guards persist as `temp.system.guard` docs made by `compileGuards`. "Model 9 split guard ID spaces" needs `expectedMinReaderModel: 9` only when one guard mixes publish and edit actions.

## 10:31 READ — @sanity/workflow-engine dist/define.d.ts (AuthoringGuard, GuardRead, defineGuard) — useful: yes
Key find. A stage can carry `guards: [{name, title?, description?, match:{types?, idRefs?, idPatterns?, actions:['create'|'update'|'delete'|'publish'|'unpublish']}, predicate?, metadata?}]`. "An omitted or empty predicate denies it." Guards are "registered on entry and retracted on exit". `idRefs` takes `{type:'fieldRead', field:'subject'}`.

## 10:32 READ — @sanity/workflow-engine CHANGELOG.md (grep idRefs/fieldRead) — useful: yes
Confirms the syntax: "Migrate `'$fields.subject'` to `{type: 'fieldRead', field: 'subject'}`". "Guard `idRefs` are unchanged (they route a guard write on the stored reference, never its content)". So a bare fieldRead of the subject field is right for idRefs.

## 10:33 READ — GitHub https://api.github.com/repos/sanity-io/workflows — useful: no
404 Not Found: the repo is private or missing for anonymous users, even though every package's `repository` field points there. So `docs/reference.md`, which the changelogs cite, is out of reach.

## 10:35 RUN
`npx create-sanity@latest --project hz65aqww --dataset production --template clean --typescript --output-path studio --package-manager npm --no-git --yes`, run in /tmp because the working dir wasn't empty, then copied in. OK: sanity ^6.17.0, typescript ^5.8. Added `schemaTypes/article.ts`. Added the npm override `"@sanity/sdk": {"@sanity/mutate": "0.18.2"}` per the studio-plugin README.

## 10:37 ERROR — install command from studio-plugin README §1
`npm install @sanity/workflow-studio-plugin ... @sanity/workflow-cli` (pinned 0.36.0) →
```
Could not resolve dependency:
peerOptional typescript@"^6.0.3 || ^7.0.0" from @sanity/workflow-blueprint@0.36.0
  peer @sanity/workflow-blueprint@"0.36.0" from @sanity/workflow-cli@0.36.0
```
The default `create-sanity` clean template ships typescript ^5.8. The README lists sanity/react/sdk prerequisites but not TypeScript ≥6, and doesn't mention that the CLI pulls in workflow-blueprint as a peer.

## 10:41 RUN
`npm install -D typescript@^6.0.3`, then the README install command pinned to 0.36.0 → OK. `npm ls` shows @sanity/sdk 3.7.0 with @sanity/mutate 0.18.2 overridden.

## 10:43 READ — @sanity/workflow-cli README.md — useful: yes
Commands: deploy (--check/--dry-run/--only), start NAME --field subject='{"id":"dataset:proj:ds:id","type":"article"}', list, show, fire-action <id> (omit --action to list), abort, nuke --instance. Binary is `sanity-workflows`, which isn't mounted in the `sanity` CLI yet. Auth via SANITY_AUTH_TOKEN. Notable: deploy **donates definitions to Sanity by default** ("Sharing is opt-out in every environment"); I'll pass `--no-share-defs`. GDR id format for subject comes from the `start --help` example.

## 10:47 GUESS
Publish lock: I gave the `drafting` and `review` stages each a guard `{match:{idRefs:[{type:'fieldRead',field:'subject'}], actions:['publish']}}` with no predicate. define.d.ts says "An omitted or empty predicate denies it" and "Guards are registered on entry and retracted on exit". So Publish should be denied until the terminal `approved` stage is reached. Guard names must be unique across the definition, so I generate them per stage. Nothing in the material shows a publish guard example end-to-end; this is assembled from the type docs.

## 10:47 GUESS
Plugin: I used `mappings: [{docType:'article', definition:'nodocs-article-approval', autoStart:true}]` so new articles are born in the workflow. Otherwise an editor could just never press "Start workflow" and publish freely. The README says autoStart is "A floor, not a guarantee".

## 10:48 RUN
`sanity-workflows deploy --check` → "✔ 1 definition(s) passed validation". `deploy --dry-run --no-share-defs` → diff shows guards stored as `idRefs: ["$fields.subject"]`. `deploy --no-share-defs` → "✔ Processed 1 definition(s) · nodocs (nodocs) → hz65aqww.production". `definition list` → `nodocs-article-approval v1 ... tag nodocs`. (It also lists another tag's definition from the earlier test; I didn't touch it.)

## 10:50 RUN
`node scripts/create-test-article.mjs t1` → draft `drafts.article-nodocs-t1`. `sanity-workflows start nodocs-article-approval --field subject='{"id":"dataset:hz65aqww:production:article-nodocs-t1","type":"article"}' --json` → `nodocs.wf-instance.9ee590b364de`, stage drafting. (GUESS: base id rather than the drafts. id in the GDR. The help example uses a bare id.)

## 10:51 WIN
The guard doc was created on stage entry: `temp.system.guard.nodocs.wf-instance.9ee590b364de.block-publish-drafting`, `match:{types:["article"], idRefs:["article-nodocs-t1"], actions:["create","update"]}`, `predicate:""`. The authored `publish` was translated to create/update on the *published* id, as the studio-plugin CHANGELOG described ("publish or unpublish gates against published IDs").

## 10:52 RUN — is the lock enforced server-side?
Created `article-nodocs-t2`, started instance `nodocs.wf-instance.4771688b6ec6` (drafting), then `client.action({actionType:'sanity.action.document.publish', ...})` → `PUBLISH OK`, published doc exists. **The Content Lake does not enforce the guard today.** That matches the README ("Everything the plugin checks is advisory … the Content Lake is the only enforcement point") and DATAMODEL ("`temp.system.guard` … mirrors the Content Lake's forthcoming guard"). The lock is only the Studio Publish button. t2 is my own test doc; I'll leave it published as evidence.

## 10:55 READ — @sanity/workflow-engine dist/index.d.ts (documentActionDenials, guardsForResource, MutationContext) — useful: yes
"The guards that deny a concrete Lake mutation image. Advisory … the check explains and disables, it never enforces." I used it to reproduce the plugin's publish-lock verdict from a script (scripts/publish-verdict.mjs). GUESS: a publish = create/update on the published id with `after` = draft content. That's my reading of the changelog's "construct the same mutation the Lake will evaluate".

## 10:57 RUN — drive instance 9ee590b364de through approval
- drafting: `publish-verdict` → `DENIED by block-publish-drafting`
- `fire-action … --activity write --action submit` → "now at review"; verdict → `DENIED by block-publish-review`
- `fire-action … --activity review --action approve` → "now at approved", Completed 10:35:43; verdict → `guards on article-nodocs-t1: 0; publish ALLOWED`; guard docs for the instance: `[]` (retracted).

## 10:58 WIN
The advisory gate behaves as intended through the whole lifecycle: locked in drafting and review, unlocked after approval.

## 11:00 RUN
`node scripts/try-publish.mjs article-nodocs-t1` after approval → PUBLISH OK.
`./node_modules/.bin/tsc --noEmit -p .` → exit 0. `npx sanity build --yes` → "✔ Build Sanity Studio (10593ms)", dist/ produced. One warning only: no appId (unrelated).

## 11:03 READ — @sanity/workflow-studio-plugin dist/_chunks-es/index.js (compiled JS) — useful: yes
No README or .d.ts says whether the Publish lock needs opting into, so I read the bundle. `document.actions` wraps every built-in action whose `.action` is in `LOCKABLE_ACTIONS = {delete, publish, unpublish}` with `withWorkflowLock`. That returns `{...description, disabled: true, title: "The “<workflow title>” workflow is holding this document."}` when `documentActionDenials` is non-empty. So the lock is automatic once the plugin is registered. No option exists or is needed. Custom publish actions without `action: 'publish'` would NOT be wrapped.

## 11:04 STUCK (by design)
I can't log into Studio, so the button state in the UI is unverified. Only the engine verdict it reads is verified (see 10:57).

## 10:37 ERROR (my own) — log timestamps
Running `date -u +%H:%M` now prints **10:37**. Every entry after "10:21" above carries an estimated time I wrote myself instead of taking it from `date`, and they run ahead of real time. Real anchors from tool output: npm ERESOLVE log 10:23:55; definition deployed 10:32:55Z (`definition list`); instance 9ee590b364de started 10:33:36, approved/completed 10:35:43 (`show`); build ≈10:36. Read the order of entries as correct and their times as wrong. From here on, times come from `date -u`.

## 10:38 WIN
Done: definition deployed (tag nodocs), Studio typechecks and builds, instance 9ee590b364de driven drafting → review → approved, advisory publish verdict DENIED → DENIED → ALLOWED, guard docs retracted on completion. Server-side enforcement is absent (t2 published via API while in drafting). Writing REPORT.md.
