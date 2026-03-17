import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {POST_QUERY, POST_SLUGS_QUERY} from '@/sanity/queries'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: POST_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata({params}: Props) {
  const {data} = await sanityFetch({
    query: POST_QUERY,
    params: await params,
    stega: false,
  })
  return {title: data?.title ?? 'Post not found'}
}

export default async function PostPage({params}: Props) {
  const {data: post} = await sanityFetch({
    query: POST_QUERY,
    params: await params,
  })
  if (!post) notFound()
  return (
    <article className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
    </article>
  )
}