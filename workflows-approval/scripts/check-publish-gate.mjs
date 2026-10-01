// Asks the engine's own guard evaluator whether publishing the given article
// would be denied right now, using the guard documents deployed in the dataset.
// This is the same check the Studio plugin makes before disabling Publish.
// Usage: node scripts/check-publish-gate.mjs <publishedId>
import {createClient} from '@sanity/client'
import {documentActionDenials} from '@sanity/workflow-engine'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const client = createClient({
  projectId,
  dataset,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2025-02-19',
  useCdn: false,
  perspective: 'raw',
})

const id = process.argv[2] ?? 'article-wf-test-1'
const guards = await client.fetch(`*[_type == "temp.system.guard" && $id in match.idRefs]`, {id})
const published = await client.getDocument(id)
const before = published ?? null
const after = {...(published ?? {_id: id, _type: 'article'}), title: 'Publishing a new version'}

const denied = await documentActionDenials({
  resource: {type: 'dataset', id: `${projectId}.${dataset}`},
  guards,
  mutation: {before, after, action: before ? 'update' : 'create'},
})

console.log(`guards on ${id}: ${guards.map((g) => g._id).join(', ') || '(none)'}`)
console.log(denied.length ? `PUBLISH DENIED by: ${denied.map((g) => g.sourceStage + '/' + g._id).join(', ')}` : 'PUBLISH ALLOWED')
