import { describe, expect, it } from 'vitest'
import { createContextNote, deleteContextNote, updateContextNote } from './contextNotes'

describe('context note management', () => {
  it('creates a local conversation note with sensible defaults', () => {
    expect(createContextNote('note-1', '2026-10-04T00:00:00.000Z')).toEqual({
      id: 'note-1',
      title: 'New conversation',
      details: '',
      updatedAt: '2026-10-04T00:00:00.000Z',
    })
  })

  it('updates only the selected note', () => {
    const notes = [createContextNote('one'), createContextNote('two')]
    const updated = updateContextNote(notes, 'two', { details: 'Enjoys photography' }, 'now')

    expect(updated[0]).toEqual(notes[0])
    expect(updated[1]).toMatchObject({ id: 'two', details: 'Enjoys photography', updatedAt: 'now' })
  })

  it('deletes only the selected note', () => {
    const notes = [createContextNote('one'), createContextNote('two')]

    expect(deleteContextNote(notes, 'one').map((note) => note.id)).toEqual(['two'])
  })
})
