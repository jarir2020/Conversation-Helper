import type { ContextNote } from '../types'

export function createContextNote(
  id: string = crypto.randomUUID(),
  updatedAt = new Date().toISOString(),
): ContextNote {
  return {
    id,
    title: 'New conversation',
    details: '',
    updatedAt,
  }
}

export function updateContextNote(
  notes: ContextNote[],
  id: string,
  updates: Partial<Pick<ContextNote, 'title' | 'details'>>,
  updatedAt = new Date().toISOString(),
): ContextNote[] {
  return notes.map((note) => note.id === id ? { ...note, ...updates, updatedAt } : note)
}

export function deleteContextNote(notes: ContextNote[], id: string): ContextNote[] {
  return notes.filter((note) => note.id !== id)
}
