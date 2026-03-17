import {defineQuery} from 'next-sanity'
export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{"slug": slug.current}`)
export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{_id, title, slug, body}`)
export const POSTS_QUERY = defineQuery(`*[_type == "post"] | order(_createdAt desc){_id, title, slug, body}`)