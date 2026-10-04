import type { Suggestion } from '../types'

// These small local prompts keep the app useful before the imported reference
// collection finishes loading, and provide a few prompts written for this app.
export const suggestions: Suggestion[] = [
  {
    id: 'local-small-joys',
    kind: 'topic',
    text: 'Small things that reliably improve your day',
    category: 'Easy openers',
    level: 'light',
    tone: 'thoughtful',
    followUp: 'When did you discover that little routine or pleasure?',
    sourceLabel: 'Conversation Helper original',
    sourceUrl: 'https://conversationstartersworld.com/topics-to-talk-about/',
  },
  {
    id: 'local-perfect-weekend',
    kind: 'question',
    text: 'What would your perfect unplanned weekend look like?',
    category: 'Easy openers',
    level: 'light',
    tone: 'hypothetical',
    followUp: 'Would you want company or a little time alone?',
    sourceLabel: 'Conversation Helper original',
    sourceUrl: 'https://conversationstartersworld.com/250-conversation-starters/',
  },
  {
    id: 'local-learn',
    kind: 'question',
    text: 'What is something you would enjoy learning if time did not matter?',
    category: 'Ideas & technology',
    level: 'normal',
    tone: 'thoughtful',
    followUp: 'What would your first small step be?',
    sourceLabel: 'Conversation Helper original',
    sourceUrl: 'https://conversationstartersworld.com/250-conversation-starters/',
  },
  {
    id: 'local-reset',
    kind: 'question',
    text: 'What do you do when you need to reset after a stressful day?',
    category: 'Everyday life',
    level: 'normal',
    tone: 'thoughtful',
    followUp: 'Has that always been your way of recovering?',
    sourceLabel: 'Conversation Helper original',
    sourceUrl: 'https://conversationstartersworld.com/random-question-generator/',
  },
]

export const referenceDataUrl = '/data/referenceSuggestions.json'
