import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const BASE_URL = 'https://conversationstartersworld.com'
const OUTPUT_PATH = resolve('public/data/referenceSuggestions.json')
const SOURCE_PAGES = [
  { page: 'wp-1225', sourcePath: '/topics-to-talk-about/' },
  { page: 'wp-5', sourcePath: '/250-conversation-starters/' },
]

const groupLabels = {
  conversation: 'Conversation starters',
  'getting-to-know': 'Getting to know someone',
  icebreakers: 'Icebreakers',
  funny: 'Funny questions',
  friends: 'Friends',
  dating: 'Dating and relationships',
  guys: 'Questions to ask a guy',
  girls: 'Questions to ask a girl',
  'would-you-rather': 'Would you rather',
  'would-you-rather-kids': 'Would you rather for kids',
  deep: 'Deep conversations',
  philosophical: 'Philosophical questions',
  hypothetical: 'Hypothetical questions',
  controversial: 'Controversial questions',
  more: 'More questions',
}

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) throw new Error(`${response.status} while fetching ${path}`)
  return response.json()
}

async function getOptionalJson(path) {
  const response = await fetch(`${BASE_URL}${path}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${response.status} while fetching ${path}`)
  return response.json()
}

function chunkForQid(qid) {
  if (qid.startsWith('g1957-r')) return Math.floor(Number(qid.slice(7)) / 64)
  const match = qid.match(/-b(\d+)$/)
  return match ? Math.floor(Number(match[1]) / 64) : null
}

function levelFor(category, type) {
  if (type === 'topic') return 'light'
  if (/deep|philosoph|controversial|personal|serious/i.test(category)) return 'deep'
  if (/hypothetical|would you rather|funny|weird|random/i.test(category)) return 'light'
  return 'normal'
}

function toneFor(category, title) {
  const searchable = `${category} ${title}`
  if (/hypothetical|would you rather/i.test(searchable)) return 'hypothetical'
  if (/funny|weird|random|trivia/i.test(searchable)) return 'fun'
  if (/personal|dating|relationship|friends|guy|girl/i.test(searchable)) return 'personal'
  return 'thoughtful'
}

function toSuggestion(item, category) {
  const pageTitle = item.pageTitle || 'Conversation Starters World'
  const sourceUrl = `${BASE_URL}${item.sourcePath || '/'}#q-${item.qid}`

  return {
    id: `reference-${item.id}`,
    kind: item.type === 'topic' ? 'topic' : 'question',
    text: item.title.trim(),
    category: category || item.sectionTitle || pageTitle,
    level: levelFor(category || item.sectionTitle || '', item.type),
    tone: toneFor(category || item.sectionTitle || '', item.title),
    followUp: (item.context || item.sectionContext || '').trim(),
    answer: (item.answer || '').trim(),
    sectionContext: (item.sectionContext || '').trim(),
    sourceLabel: `Conversation Starters World · ${pageTitle}`,
    sourceUrl,
    sourceId: item.id,
    pageTitle,
    sourcePath: item.sourcePath || '/',
    sectionTitle: item.sectionTitle || '',
    locale: item.locale || 'en',
    sourceRevision: item.revision || '',
  }
}

async function fetchChunks(page, chunkNumbers) {
  const uniqueChunks = [...new Set(chunkNumbers)].filter((chunk) => chunk !== null)
  const responses = await Promise.all(uniqueChunks.map(async (chunk) => ({
    chunk,
    data: await getJson(page === 'generator-1957'
      ? `/generator-data/${chunk}.json`
      : `/reader-data/${page}/${chunk}.json`),
  })))

  return responses.flatMap(({ data }) => data.items || [])
}

async function fetchPageRecords(page) {
  const items = []
  for (let chunk = 0; chunk < 16; chunk += 1) {
    const data = await getOptionalJson(`/reader-data/${page}/${chunk}.json`)
    if (!data) break
    items.push(...(data.items || []))
  }
  return items
}

async function main() {
  const generatorIndex = await getJson('/generator-data/index.json')
  const generatorRefs = generatorIndex.refs || []
  // Fetch by page because several pages share the same chunk numbers.
  const generatorPages = [...new Set(generatorRefs.map((ref) => ref.page))]
  const generatorRecords = (await Promise.all(generatorPages.map(async (page) => {
    const pageRefs = generatorRefs.filter((ref) => ref.page === page)
    const items = await fetchChunks(page, pageRefs.map((ref) => chunkForQid(ref.qid)))
    const requested = new Set(pageRefs.map((ref) => ref.qid))
    return items.filter((item) => requested.has(item.qid))
  }))).flat()

  const pageRecords = (await Promise.all(SOURCE_PAGES.map((source) => fetchPageRecords(source.page)))).flat()
  const pageRecordIds = new Set(pageRecords.map((item) => item.id))
  const generatorById = new Map(generatorRefs.map((ref) => [ref.qid, ref]))
  const records = [...pageRecords]

  for (const item of generatorRecords) {
    if (!pageRecordIds.has(item.id)) records.push(item)
  }

  const output = records.map((item) => {
    const ref = generatorById.get(item.qid)
    const category = item.type === 'topic'
      ? item.sectionTitle
      : (groupLabels[ref?.group] || item.sectionTitle || item.pageTitle)
    return toSuggestion(item, category)
  })

  const unique = [...new Map(output.map((item) => [item.id, item])).values()]
  await mkdir(resolve('public/data'), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(unique, null, 2)}\n`, 'utf8')

  const questionCount = unique.filter((item) => item.kind === 'question').length
  const topicCount = unique.filter((item) => item.kind === 'topic').length
  console.log(`Imported ${unique.length} records (${questionCount} questions, ${topicCount} topics).`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
