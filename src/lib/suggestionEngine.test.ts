import { describe, expect, it } from 'vitest'
import { suggestions } from '../data/questions'
import { filterSuggestions, selectRandomSuggestion } from './suggestionEngine'

describe('filterSuggestions', () => {
  it('filters by kind, category, and tone', () => {
    const result = filterSuggestions(suggestions, {
      mode: 'question',
      category: 'Easy openers',
      tone: 'hypothetical',
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.kind === 'question')).toBe(true)
    expect(result.every((item) => item.category === 'Easy openers')).toBe(true)
    expect(result.every((item) => item.tone === 'hypothetical')).toBe(true)
  })

  it('returns both kinds in surprise mode', () => {
    const result = filterSuggestions(suggestions, {
      mode: 'surprise',
      category: 'all',
      tone: 'all',
    })

    expect(new Set(result.map((item) => item.kind))).toEqual(new Set(['topic', 'question']))
  })

  it('searches across prompt text, categories, and notes', () => {
    const result = filterSuggestions(suggestions, {
      mode: 'surprise',
      category: 'all',
      tone: 'all',
      query: 'perfect weekend',
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('local-perfect-weekend')
  })
})

describe('selectRandomSuggestion', () => {
  it('avoids excluded suggestions while choices remain', () => {
    const [first, second] = suggestions
    const result = selectRandomSuggestion([first, second], new Set([first.id]), () => 0)

    expect(result?.id).toBe(second.id)
  })

  it('starts a new round when every choice has been seen', () => {
    const [first, second] = suggestions
    const result = selectRandomSuggestion([first, second], new Set([first.id, second.id]), () => 0.99)

    expect(result?.id).toBe(second.id)
  })

  it('returns null for an empty pool', () => {
    expect(selectRandomSuggestion([])).toBeNull()
  })
})
