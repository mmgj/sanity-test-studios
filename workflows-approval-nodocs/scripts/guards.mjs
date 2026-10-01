// Lists guard docs whose name comes from this definition (block-publish-*) and the given instance.
import {createClient} from '@sanity/client'
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2026-04-29',
  useCdn: false,
  perspective: 'raw',
})
const inst = process.argv[2]
const docs = await client.fetch(
  `*[_type in ["temp.system.guard","system.guard"] && _id match "*" + $inst + "*" || (_type in ["temp.system.guard","system.guard"] && references($inst))]`,
  {inst},
)
console.log(JSON.stringify(docs, null, 2))
