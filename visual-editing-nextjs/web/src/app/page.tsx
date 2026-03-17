import Link from 'next/link'
import {sanityFetch} from '@/sanity/lib/live'
import {POSTS_QUERY} from '@/sanity/queries'

export default async function HomePage() {
  const {data: posts} = await sanityFetch({query: POSTS_QUERY})
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      {posts.length === 0 && <p>No posts yet. Create one in the Studio.</p>}
      <ul className="space-y-4">
        {posts.map((post: any) => (
          <li key={post._id}>
            <Link href={`/posts/${post.slug?.current}`} className="text-blue-600 hover:underline text-xl">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}