// Usage: node scripts/create-test-article.mjs <suffix>
// Creates a draft article `drafts.article-nodocs-<suffix>` (never published).
import {createClient} from '@sanity/client'

const suffix = process.argv[2] ?? Date.now().toString(36)
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2026-04-29',
  useCdn: false,
})
const id = `article-nodocs-${suffix}`
await client.createOrReplace({
  _id: `drafts.${id}`,
  _type: 'article',
  title: `Nodocs approval test ${suffix}`,
  body: 'Test article for the approval workflow.',
})
console.log(id)
