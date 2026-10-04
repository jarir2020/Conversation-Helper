# Conversation-Helper

Conversation Helper is a local-first web app for the moments when an online conversation goes quiet. It suggests a topic or question, keeps suggestions from repeating during a round, and provides a small private notepad for conversation context.

## Features

- Surprise, topic, and question modes
- Quick search across the full imported collection, categories, and source notes
- Category and tone filters
- No-repeat rounds with previous-suggestion navigation
- Favorites and recently viewed suggestions stored in the browser
- Copy a prompt, or copy it together with selected context
- Context notepad for interests, past topics, and follow-up ideas
- Imported topic and question collections with source attribution
- Original Conversation Helper prompts alongside the imported collection
- Responsive, static, backend-free interface

## Tech stack

- React + TypeScript
- Vite
- Vitest
- Static JSON content
- Browser `localStorage`

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Redeploy to Vercel

If this GitHub repository is connected to the Vercel project, push the tested change to the production branch:

```bash
npm test
npm run build
git add .gitignore README.md plan.md src/App.tsx src/data/questions.ts src/lib/suggestionEngine.ts src/lib/suggestionEngine.test.ts src/styles.css
git diff --cached --check
git commit -m "Add topic search and more conversation prompts"
git push origin main
```

Vercel should create a deployment for the push and promote it to production when `main` is configured as the production branch. You can follow the build under the project’s Deployments tab.

If the project is not connected to GitHub, deploy from this repository’s root with the Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel link
vercel --prod
```

You can also manually redeploy an existing deployment from Vercel Dashboard → Project → Deployments → `…` → Redeploy. Confirm whether to use the existing build cache before starting the redeploy.

## Verification and import commands

```bash
npm test
npm run build
npm run import:references
```

The importer refreshes `public/data/referenceSuggestions.json` from the authorized source endpoints. The current import contains 5,063 records: 4,962 questions and 101 topics. It preserves source URLs, source IDs, revisions, notes, and available answers.

The imported material comes from Conversation Starters World, including [Topics to Talk About](https://conversationstartersworld.com/topics-to-talk-about/), [250 Conversation Starters](https://conversationstartersworld.com/250-conversation-starters/), and the [Random Question Generator](https://conversationstartersworld.com/random-question-generator/). The project owner has confirmed permission to redistribute this imported content. Reconfirm that permission before publishing a refreshed dataset elsewhere.

## Privacy

Favorites, history, and context notes stay in the current browser through `localStorage`. No account or backend is required. Do not save passwords, addresses, credentials, or other sensitive personal information in the notepad.

## License

The application code is released under the [MIT License](LICENSE). Imported reference content remains subject to the permissions and terms that authorize its redistribution.
