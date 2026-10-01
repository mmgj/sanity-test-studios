// Creates a published test article (the workflow subject must be a published _id).
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2025-02-19',
  useCdn: false,
})

const id = process.argv[2] ?? 'article-wf-test-1'
const doc = await client.createOrReplace({
  _id: id,
  _type: 'article',
  title: 'Workflow approval test article',
  slug: {_type: 'slug', current: id},
})
console.log(`published ${doc._id} rev ${doc._rev}`)
