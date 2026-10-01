# Workflows approval test Studio (no docs)

Test Studio for the Sanity Workflows usability test (2026-10-01). A contextless agent built it from npm package material and public GitHub only, without the docs site. The goal: an editor has to get approval before a document is published. Compare it with `../workflows-approval/` (branch `usability/workflows-approval`), which was built from the docs.

## Project

- Sanity project: `hz65aqww`
- Dataset: `production`
- Workflows deployment and tag: `nodocs`, definition `nodocs-article-approval`
- Workflows packages: `@sanity/workflow-*` at 0.36.0, TypeScript ^6.0.3

## Run locally

```sh
cd workflows-approval-nodocs
npm install
npx sanity dev
```

Open http://localhost:3333 and log in.

The Workflows CLI (`npx sanity-workflows ...`) reads `SANITY_AUTH_TOKEN` or your `sanity login` session. Copy `.env.local.example` to `.env.local` if you need a token for the scripts in `scripts/`.

## What to check in Studio

1. Structure > Article > create new. The workflow strip should show Article approval / Drafting, and Publish should be disabled, with the tooltip "The “Article approval” workflow is holding this document."
2. In the Workflows tab, click Submit for approval, then Approve. Publish should become enabled.
3. Optional: open `article-nodocs-t2` (its workflow is still in Drafting). Edit a field. Publish should be disabled.

## Files

- `workflows/article-approval.ts`: definition (drafting > review > approved, with a publish guard on both holding stages)
- `sanity.workflow.ts`: deployment config
- `sanity.config.ts`: Studio with `workflowStudioPlugin` and `workflowDefaultDocumentNode`
- `scripts/`: CLI-side checks used during the test
- `_log/LOG.md`, `_log/REPORT.md`: the tester's log and report (some log timestamps were estimated; see the correction entry)
