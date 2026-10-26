import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import FormDesigner from '../../src/pages/FormDesigner'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null)
    return vi.fn()
  }),
}))

vi.mock('../../src/lib/firebase', () => ({ auth: {} }))

vi.stubGlobal('fetch', vi.fn((url) => {
  if (String(url).includes('/api/logic-engine/questions')) {
    return Promise.resolve({
      ok: true,
      json: async () => [{ qKey: 'parentalRights.test', qText: 'Sample parental-rights question', section: 'parental-rights' }],
    })
  }
  return Promise.resolve({ ok: true, json: async () => ({}) })
}))

describe('FormDesigner', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetch).mockClear()
  })

  it('renders the blank designer and both PDF formats', async () => {
    renderWithRouter(<FormDesigner />)

    expect(screen.getByRole('heading', { name: 'Form Designer' })).toBeInTheDocument()
    expect(screen.getByLabelText('Document title')).toHaveValue('Parenting Plan Questionnaire Responses')
    expect(screen.getByRole('option', { name: 'Review PDF' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Comparison PDF' })).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/logic-engine/questions'),
    ))
  })

  it('adds editable document text and switches PDF formats', async () => {
    renderWithRouter(<FormDesigner />)

    await userEvent.click(screen.getByRole('button', { name: /add section heading/i }))
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1)

    await userEvent.selectOptions(screen.getByLabelText('PDF format'), 'comparison')
    expect(screen.getByLabelText('Document title')).toHaveValue('Merged Parenting Plan Responses')
  })

  it('shows the question-pages palette', async () => {
    renderWithRouter(<FormDesigner />)

    expect(await screen.findByRole('tab', { name: 'Personal info' })).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Question pages' })).toBeInTheDocument()
  })
})
