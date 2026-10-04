I read `plan.txt`. The workspace currently contains only that file, so there is no existing implementation to preserve.

## Recommended direction

Build a small web GUI rather than a CLI.

A GUI is better because you can keep it open while chatting, quickly copy a suggestion, save favorites, and use it without installing anything.

Recommended stack:

- React + TypeScript
- Vite
- Plain CSS or lightweight CSS modules
- Local JSON content
- `localStorage` for favorites and history
- Vitest for testing
- Static deployment through GitHub Pages, Netlify, or Vercel

No backend is needed for the first version.

The referenced sources provide useful structures: categorized topics, hundreds of conversation starters, topic selection, random generation, copying, saving, and “no repeat in a round” behavior. [Topics to Talk About](https://conversationstartersworld.com/topics-to-talk-about/), [250 Conversation Starters](https://conversationstartersworld.com/250-conversation-starters/), [Random Question Generator](https://conversationstartersworld.com/random-question-generator/)

## Final implementation plan

1. Create the project structure and initialize Git.
2. Define the content model:

   - question text
   - topic/category
   - conversation level: light, normal, deep
   - tone: fun, thoughtful, personal, hypothetical
   - optional follow-up prompt
   - source attribution

3. Prepare a small, curated dataset based on the referenced sources. Avoid runtime scraping; keep the app reliable and include source links.
4. Build the suggestion engine:

   - random topic
   - random question
   - surprise mode
   - category filtering
   - no immediate repeats
   - previous suggestion support

5. Build the main interface:

   - large suggestion card
   - “New suggestion” button
   - Topic / Question / Surprise selector
   - Quick search across prompt text, topics, categories, and source notes
   - category and tone filters
   - Copy button
   - Save button
   - Skip button

6. Add favorites and recently viewed suggestions using `localStorage`.
7. Add a small private context notepad for managing conversation context like an LLM context window:

   - create, edit, and delete context notes
   - record a person’s interests, preferences, past topics, and follow-up ideas
   - organize notes by person or conversation
   - show relevant context beside a generated suggestion
   - allow copying selected context with the question
   - store notes locally by default using `localStorage`
   - clearly warn users not to save sensitive information

8. Add helpful conversation guidance, such as follow-up prompts and a reminder that users can skip questions they dislike.
9. Add responsive design, keyboard support, accessible labels, and mobile-friendly copy controls.
10. Add unit tests for random selection, filtering, quick search, no-repeat behavior, saved items, and context-note management.
11. Run production build checks and deploy the static application.
12. Later enhancements:

   - custom user-created questions
   - Bengali/English language support
   - daily question
   - optional AI-generated follow-up questions
   - PWA/offline support
   - optional CLI using the same content engine

The first milestone should be a polished offline-capable MVP with curated questions, random suggestions, filtering, copying, favorites, and a privacy-conscious context notepad. The notepad is for lightweight conversation memory and organization; it should not send personal context to an external service unless that feature is explicitly added later.
