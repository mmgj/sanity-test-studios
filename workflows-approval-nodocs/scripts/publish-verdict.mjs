// Usage: node scripts/publish-verdict.mjs <docId>
// Asks the engine's advisory guard check (the one the Studio publish lock reads)
// whether publishing drafts.<docId> -> <docId> would be denied right now.
import {createClient} from '@sanity/client'
import {documentActionDenials, guardsForResource} from '@sanity/workflow-engine'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const client = createClient({
  projectId,
  dataset,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2026-04-29',
  useCdn: false,
  perspective: 'raw',
})
const id = process.argv[2]
const draft = (await client.getDocument(`drafts.${id}`)) ?? {_id: `drafts.${id}`, _type: 'article'}
const published = await client.getDocument(id)
const guards = (await guardsForResource(client)).filter((g) => g.idRefs?.includes?.(id) || g.match?.idRefs?.includes(id))
const denials = await documentActionDenials({
  mutation: {
    before: published ?? null,
    after: {...draft, _id: id},
    action: published ? 'update' : 'create',
  },
  resource: {type: 'dataset', id: `${projectId}.${dataset}`},
  guards,
})
console.log(
  `guards on ${id}: ${guards.length}; publish ${denials.length ? 'DENIED by ' + denials.map((d) => d.name).join(', ') : 'ALLOWED'}`,
)
