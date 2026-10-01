# Workflows approval test Studio

Test Studio for the Sanity Workflows docs usability test (2026-10-01). A contextless agent built it from the public docs at https://www.sanity.io/docs/workflows. The goal: an editor has to get approval before a document is published.

## Project

- Sanity project: `hz65aqww`
- Dataset: `production`
- Workflows packages: `@sanity/workflow-*` pinned at 0.36.0

## Run locally

```sh
cd workflows-approval
npm install
npx sanity dev
```

Open http://localhost:3333 and log in.

The Workflows CLI (`npx sanity-workflows ...`) reads `SANITY_AUTH_TOKEN` or your `sanity login` session. Copy `.env.local.example` to `.env.local` if you need a token for the scripts in `scripts/`.

## What to check in Studio

1. Open Structure > Article > "Workflow approval test article" (`article-wf-test-2`, stage Drafting). Edit it. Publish should be disabled, with a message naming the Article approval workflow.
2. In the Workflows tab, click Submit for approval, then Approve. Publish should become enabled.
3. Create a new article. The workflow should start automatically and Publish should be disabled.

## Files

- `workflows/article-approval.ts`: definition (drafting > in-review > approved, with a publish guard on both holding stages)
- `sanity.workflow.ts`: deployment config
- `sanity.config.ts`: Studio with `workflowStudioPlugin` and `workflowDefaultDocumentNode`
- `scripts/`: CLI-side checks used during the test (`check-publish-gate.mjs` asks the engine whether a publish is denied; `raw-publish-attempt.mjs` shows that a token write bypasses the hold)
- `_log/LOG.md`, `_log/REPORT.md`: the tester's time-stamped log and report
