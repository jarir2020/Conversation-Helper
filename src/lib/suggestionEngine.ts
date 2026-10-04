import type { Suggestion, SuggestionMode, SuggestionTone } from '../types'

export interface SuggestionFilters {
  mode: SuggestionMode
  category: string
  tone: SuggestionTone | 'all'
}

export function filterSuggestions(
  allSuggestions: Suggestion[],
  { mode, category, tone }: SuggestionFilters,
): Suggestion[] {
  return allSuggestions.filter((suggestion) => {
    const modeMatches = mode === 'surprise' || suggestion.kind === mode
    const categoryMatches = category === 'all' || suggestion.category === category
    const toneMatches = tone === 'all' || suggestion.tone === tone

    return modeMatches && categoryMatches && toneMatches
  })
}

export function selectRandomSuggestion(
  pool: Suggestion[],
  excludedIds: Set<string> = new Set(),
  random = Math.random,
): Suggestion | null {
  if (pool.length === 0) return null

  const available = pool.filter((suggestion) => !excludedIds.has(suggestion.id))
  const candidates = available.length > 0 ? available : pool
  return candidates[Math.floor(random() * candidates.length)] ?? null
}
