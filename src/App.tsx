import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { referenceDataUrl, suggestions as localSuggestions } from './data/questions'
import { createContextNote, deleteContextNote, updateContextNote } from './lib/contextNotes'
import { filterSuggestions, selectRandomSuggestion } from './lib/suggestionEngine'
import type { ContextNote, Suggestion, SuggestionMode, SuggestionTone } from './types'

const STORAGE_KEYS = {
  favorites: 'conversation-helper:favorites',
  notes: 'conversation-helper:notes',
  recent: 'conversation-helper:recent',
} as const

const toneOptions: Array<{ value: SuggestionTone | 'all'; label: string }> = [
  { value: 'all', label: 'Any tone' },
  { value: 'fun', label: 'Fun' },
  { value: 'thoughtful', label: 'Thoughtful' },
  { value: 'personal', label: 'Personal' },
  { value: 'hypothetical', label: 'Hypothetical' },
]

const modeOptions: Array<{ value: SuggestionMode; label: string; icon: string }> = [
  { value: 'surprise', label: 'Surprise me', icon: '✦' },
  { value: 'topic', label: 'Topic', icon: '◌' },
  { value: 'question', label: 'Question', icon: '?' },
]

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
}

function App() {
  const [mode, setMode] = useState<SuggestionMode>('surprise')
  const [category, setCategory] = useState('all')
  const [tone, setTone] = useState<SuggestionTone | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [current, setCurrent] = useState<Suggestion>(() => localSuggestions[0])
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set([localSuggestions[0].id]))
  const [history, setHistory] = useState<Suggestion[]>([])
  const [referenceSuggestions, setReferenceSuggestions] = useState<Suggestion[]>([])
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(STORAGE_KEYS.favorites, []))
  const [recentIds, setRecentIds] = useState<string[]>(() => readStorage(STORAGE_KEYS.recent, []))
  const [notes, setNotes] = useState<ContextNote[]>(() => readStorage(STORAGE_KEYS.notes, []))
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const allSuggestions = useMemo(
    () => [...localSuggestions, ...referenceSuggestions],
    [referenceSuggestions],
  )

  const categories = useMemo(
    () => ['all', ...new Set(allSuggestions.map((suggestion) => suggestion.category))],
    [allSuggestions],
  )

  const pool = useMemo(
    () => filterSuggestions(allSuggestions, { mode, category, tone, query: deferredSearchQuery }),
    [allSuggestions, mode, category, tone, deferredSearchQuery],
  )

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null
  const favoriteSuggestions = allSuggestions.filter((suggestion) => favorites.includes(suggestion.id))

  useEffect(() => {
    let active = true

    fetch(referenceDataUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Reference collection unavailable')
        return response.json() as Promise<Suggestion[]>
      })
      .then((items) => {
        if (active && Array.isArray(items)) setReferenceSuggestions(items)
      })
      .catch(() => {
        if (active) setNotice('Reference collection could not load; local prompts are still available')
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    setSeenIds(new Set())
    const next = selectRandomSuggestion(pool)
    if (next) {
      setCurrent(next)
      setSeenIds(new Set([next.id]))
    }
  }, [mode, category, tone, pool])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentIds))
  }, [recentIds])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function moveTo(next: Suggestion | null) {
    if (!next) return
    setHistory((previous) => [current, ...previous.filter((item) => item.id !== current.id)].slice(0, 12))
    setCurrent(next)
    setSeenIds((previous) => new Set(previous).add(next.id))
    setRecentIds((previous) => [next.id, ...previous.filter((id) => id !== next.id)].slice(0, 8))
  }

  function getNextSuggestion() {
    if (pool.length === 0) return
    const next = selectRandomSuggestion(pool, seenIds)
    moveTo(next)
  }

  function showPrevious() {
    const previous = history[0]
    if (!previous) return
    setHistory((items) => items.slice(1))
    setCurrent(previous)
    setNotice('Back to your previous suggestion')
  }

  function toggleFavorite() {
    setFavorites((previous) =>
      previous.includes(current.id)
        ? previous.filter((id) => id !== current.id)
        : [current.id, ...previous],
    )
    setNotice(favorites.includes(current.id) ? 'Removed from favorites' : 'Saved to favorites')
  }

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(successMessage)
    } catch {
      setNotice('Copy was unavailable in this browser')
    }
  }

  function addNote() {
    const note = createContextNote()
    setNotes((previous) => [note, ...previous])
    setSelectedNoteId(note.id)
  }

  function updateNote(field: 'title' | 'details', value: string) {
    if (!selectedNote) return
    setNotes((previous) => updateContextNote(previous, selectedNote.id, { [field]: value }))
  }

  function deleteNote() {
    if (!selectedNote) return
    setNotes((previous) => deleteContextNote(previous, selectedNote.id))
    setSelectedNoteId(null)
    setNotice('Context note deleted')
  }

  const isFavorite = favorites.includes(current.id)
  const contextToCopy = selectedNote
    ? `${selectedNote.title}\n${selectedNote.details}\n\nQuestion: ${current.text}`
    : current.text
  const hasResults = pool.length > 0

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Conversation Helper home">
          <span className="brand-mark">✺</span>
          <span>Conversation Helper</span>
        </a>
        <div className="topbar-note">
          <span className="status-dot" />
          Your little idea desk
        </div>
      </header>

      <section className="intro-grid">
        <div className="intro-copy">
          <p className="eyebrow">A gentle nudge for better conversations</p>
          <h1>Never run out of something <em>real</em> to say.</h1>
          <p className="intro-text">
            Find a thoughtful topic, keep a little context, and let the conversation take it from there.
          </p>
        </div>
        <div className="intro-stat">
          <span className="stat-number">{referenceSuggestions.length ? allSuggestions.length.toLocaleString() : '…'}</span>
          <span className="stat-label">imported prompts<br />to get you started</span>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="generator-column">
          <div className="mode-tabs" role="tablist" aria-label="Suggestion type">
            {modeOptions.map((option) => (
              <button
                className={`mode-tab ${mode === option.value ? 'active' : ''}`}
                key={option.value}
                onClick={() => setMode(option.value)}
                role="tab"
                aria-selected={mode === option.value}
              >
                <span>{option.icon}</span> {option.label}
              </button>
            ))}
          </div>

          <div className="quick-search">
            <label className="search-field">
              <span>Quick search</span>
              <div className="search-input-wrap">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search questions, topics, or ideas"
                  aria-label="Search questions, topics, or ideas"
                />
                {searchQuery && <button type="button" className="clear-search" onClick={() => setSearchQuery('')} aria-label="Clear search">×</button>}
              </div>
            </label>
            <span className="search-result-count">
              {searchQuery ? `${pool.length.toLocaleString()} match${pool.length === 1 ? '' : 'es'}` : 'Search the full collection'}
            </span>
          </div>

          <div className="filter-row">
            <label>
              <span>Explore</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => (
                  <option value={item} key={item}>{item === 'all' ? 'All categories' : item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Feeling</span>
              <select value={tone} onChange={(event) => setTone(event.target.value as SuggestionTone | 'all')}>
                {toneOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <span className="round-label"><span className="round-dot" /> No repeats this round</span>
          </div>

          <article className={`suggestion-card ${hasResults ? '' : 'no-results'}`}>
            {hasResults ? (
              <>
                <div className="card-topline">
                  <span className="category-pill">{current.category}</span>
                  <button className={`favorite-button ${isFavorite ? 'saved' : ''}`} onClick={toggleFavorite} aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}>
                    {isFavorite ? '♥ Saved' : '♡ Save'}
                  </button>
                </div>
                <div className="suggestion-content">
                  <span className="suggestion-kind">{current.kind === 'topic' ? 'TOPIC TO EXPLORE' : 'QUESTION TO ASK'}</span>
                  <h2>{current.text}</h2>
                  <div className="follow-up">
                    <span className="follow-icon">↳</span>
                    <div><strong>{current.sourceId ? 'Notes from the source' : 'A natural follow-up'}</strong><p>{current.followUp || 'Let the answer guide your next question.'}</p></div>
                  </div>
                  {current.answer && (
                    <details className="answer-details">
                      <summary>Reveal imported answer</summary>
                      <p>{current.answer}</p>
                    </details>
                  )}
                </div>
                <div className="card-footer">
                  <span className={`level level-${current.level}`}>{current.level} conversation</span>
                  <a href={current.sourceUrl} target="_blank" rel="noreferrer">{current.sourceLabel} ↗</a>
                </div>
              </>
            ) : (
              <div className="empty-suggestion">
                <span className="empty-suggestion-mark">⌕</span>
                <span className="suggestion-kind">NO MATCHES YET</span>
                <h2>Try a broader search.</h2>
                <p>Search for a shorter keyword, or clear the search to explore the full collection.</p>
                <button className="empty-clear-button" onClick={() => { setSearchQuery(''); setCategory('all'); setTone('all') }}>Clear filters</button>
              </div>
            )}
          </article>

          <div className="action-row">
            <button className="secondary-button" onClick={showPrevious} disabled={history.length === 0}>← Previous</button>
            <button className="primary-button" onClick={getNextSuggestion} disabled={!hasResults}>New suggestion <span>↗</span></button>
            <button className="secondary-button" onClick={() => copyText(contextToCopy, selectedNote ? 'Context and prompt copied' : 'Prompt copied')} disabled={!hasResults}>Copy <span>⌘</span></button>
          </div>

          <div className="tip-line"><span>✦</span> You do not have to use every question. Keep the ones that feel natural.</div>

          {favoriteSuggestions.length > 0 && (
            <section className="favorites-section">
              <div className="section-heading"><div><p className="eyebrow">Your saved sparks</p><h3>Favorites</h3></div><span>{favoriteSuggestions.length} saved</span></div>
              <div className="favorite-list">
                {favoriteSuggestions.slice(0, 3).map((item) => (
                  <button key={item.id} className="favorite-item" onClick={() => { setHistory((previous) => [current, ...previous]); setCurrent(item) }}>
                    <span>{item.kind === 'topic' ? '◌' : '?'}</span><span>{item.text}</span><b>→</b>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="notepad-panel">
          <div className="notepad-heading">
            <div><p className="eyebrow">Keep the thread</p><h3>Context notepad</h3></div>
            <button className="add-note-button" onClick={addNote} aria-label="Add a context note">+</button>
          </div>
          <p className="notepad-intro">A small memory space for the details you want to remember, like an LLM context window.</p>

          {notes.length === 0 ? (
            <button className="empty-note" onClick={addNote}><span className="empty-note-icon">＋</span><strong>Start a conversation note</strong><span>Keep interests, past topics, and follow-up ideas in one place.</span></button>
          ) : (
            <>
              <div className="note-list" aria-label="Conversation notes">
                {notes.map((note) => (
                  <button key={note.id} className={`note-list-item ${selectedNoteId === note.id ? 'active' : ''}`} onClick={() => setSelectedNoteId(note.id)}>
                    <span className="note-avatar">{note.title.trim().charAt(0).toUpperCase() || '•'}</span>
                    <span><strong>{note.title || 'Untitled note'}</strong><small>Updated {formatDate(note.updatedAt)}</small></span>
                    <b>›</b>
                  </button>
                ))}
              </div>
              {!selectedNote && <p className="select-note-hint">Select a note to edit it, or add another one.</p>}
            </>
          )}

          {selectedNote && (
            <div className="note-editor">
              <input value={selectedNote.title} onChange={(event) => updateNote('title', event.target.value)} aria-label="Note title" placeholder="Who or what is this about?" />
              <textarea value={selectedNote.details} onChange={(event) => updateNote('details', event.target.value)} aria-label="Context details" placeholder={'Try notes like:\n• Enjoys street photography\n• Recently started a new course\n• Ask about their weekend project'} rows={7} />
              <div className="editor-actions"><button onClick={() => copyText(contextToCopy, 'Context and prompt copied')}>Copy with prompt</button><button className="delete-button" onClick={deleteNote}>Delete</button></div>
            </div>
          )}

          <div className="privacy-note"><span>♧</span><p><strong>Private by default.</strong> Notes stay in this browser. Avoid saving passwords, addresses, or other sensitive information.</p></div>
        </aside>
      </section>

      <footer className="footer"><span>Made for the moments when the chat goes quiet.</span><span>Stored locally on this device · No account needed</span></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  )
}

export default App
