export type SuggestionMode = 'surprise' | 'topic' | 'question'
export type ConversationLevel = 'light' | 'normal' | 'deep'
export type SuggestionTone = 'fun' | 'thoughtful' | 'personal' | 'hypothetical'

export interface Suggestion {
  id: string
  kind: 'topic' | 'question'
  text: string
  category: string
  level: ConversationLevel
  tone: SuggestionTone
  followUp: string
  answer?: string
  sectionContext?: string
  sourceLabel: string
  sourceUrl: string
  sourceId?: string
  pageTitle?: string
  sourcePath?: string
  sectionTitle?: string
  locale?: string
  sourceRevision?: string
}

export interface ContextNote {
  id: string
  title: string
  details: string
  updatedAt: string
}
