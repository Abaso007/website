import { notFound, redirect } from 'next/navigation'

import { getTopics } from '../../api.js'

export default async function DocTopic({ params: { topic: topicSlug } }) {
  const topics = await getTopics('beta')
  const topic = topics.find(({ slug }) => slug.toLowerCase() === topicSlug)
  const firstDocInTopic = topic?.docs[0]?.slug

  if (!topic || !firstDocInTopic) notFound()

  redirect(`/docs/beta/${topicSlug}/${firstDocInTopic}`)
}

export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_SKIP_BUILD_DOCS) return []
  if (process.env.NEXT_PUBLIC_ENABLE_BETA_DOCS !== 'true') return []

  const topics = await getTopics('beta')

  return topics.map(({ slug }) => ({
    topic: slug.toLowerCase(),
  }))
}
