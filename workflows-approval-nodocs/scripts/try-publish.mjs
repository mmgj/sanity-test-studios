// Usage: node scripts/try-publish.mjs <docId>  — attempts to publish drafts.<docId> via the Actions API.
import {createClient} from '@sanity/client'
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2026-04-29',
  useCdn: false,
})
const id = process.argv[2]
try {
  const res = await client.action({
    actionType: 'sanity.action.document.publish',
    draftId: `drafts.${id}`,
    publishedId: id,
  })
  console.log('PUBLISH OK', JSON.stringify(res))
} catch (err) {
  console.log('PUBLISH DENIED', err.statusCode, err.message)
}
console.log('published exists:', Boolean(await client.getDocument(id)))
