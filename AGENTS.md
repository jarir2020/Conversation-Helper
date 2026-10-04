# Agent Instructions

## Scope

This repository contains the Conversation Helper web application. Keep changes focused on the app, its tests, its documented import workflow, and its explicitly requested documentation.

## Before editing

- Read `plan.md` and the relevant source files.
- Preserve unrelated user changes.
- Never expose or commit credentials from `.env`, `.aws`, `.codex`, or other local configuration.

## Development workflow

1. Use the existing React/TypeScript/Vite structure.
2. Keep the context notepad local-first and privacy-conscious.
3. Keep imported records attributed to their source and preserve their stable IDs.
4. Add or update tests for behavior changes.
5. Run `npm test` and `npm run build` before handoff.

## Content import

The authorized importer is `scripts/import-reference-content.mjs`. It stores the generated collection in `public/data/referenceSuggestions.json`. Do not replace the importer with ad hoc runtime scraping or remove source attribution. Confirm that the project owner still has redistribution permission before refreshing the dataset.

## Git hygiene

Stage only project files intended for publication. Inspect the staged stat and run `git diff --cached --check` before committing. Do not stage `node_modules`, `dist`, `.env*`, `.agents`, `.aws`, `.codex`, editor state, or other local runtime artifacts.
