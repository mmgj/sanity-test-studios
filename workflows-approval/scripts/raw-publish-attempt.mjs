// Demonstrates the documented early-access limitation: a token writing the published
// document directly is NOT stopped by a workflow guard (the lake doesn't enforce them).
import {createClient} from '@sanity/client'
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2025-02-19',
  useCdn: false,
})
const id = process.argv[2]
try {
  const res = await client.patch(id).set({title: `Raw write at ${new Date().toISOString()}`}).commit()
  console.log(`RAW WRITE LANDED on ${res._id} (rev ${res._rev}) — guard not enforced by the lake`)
} catch (err) {
  console.log(`RAW WRITE REJECTED: ${err.message}`)
}
