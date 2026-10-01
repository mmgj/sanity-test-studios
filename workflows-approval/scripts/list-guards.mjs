// Lists engine guard documents (type discovered by querying, see LOG) for an instance.
import {createClient} from '@sanity/client'
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2025-02-19',
  useCdn: false,
  perspective: 'raw',
})
const types = await client.fetch(`array::unique(*[_type match "*guard*" || _type match "*workflow*" || _type match "wf*"]._type)`)
console.log('engine types:', types)
const guards = await client.fetch(`*[_type match "*guard*"]{_id, _type, sourceInstanceId, sourceStage, match, "keys": array::compact(*[false])}`)
console.log(JSON.stringify(guards, null, 2))
