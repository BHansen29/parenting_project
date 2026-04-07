import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Review from '../../src/pages/Review'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../src/components/common/InviteModal', () => ({
  default: ({ isOpen, onClose }) => {
    if (!isOpen) return null
    return (
      <div role="dialog" aria-label="Invite Modal">
        <button onClick={onClose}>Close Invite Modal</button>
      </div>
    )
  },
}))

// Render Disclaimer as a simple labelled wrapper so variant is testable
vi.mock('../../src/components/forms/Disclaimer', () => ({
  default: ({ children, variant }) => (
    <div data-testid={`disclaimer-${variant}`}>{children}</div>
  ),
}))

// useForm mock — state is controlled per test
let mockCollaborationMode = ''
let mockPlanChildren = []
const mockDispatch = vi.fn()

vi.mock('../../src/hooks/useForm', () => ({
  useForm: () => ({
    state: {
      collaborationMode: mockCollaborationMode,
      plan: { children: mockPlanChildren },
    },
    dispatch: mockDispatch,
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderReview = () => renderWithRouter(<Review />)
const setMode = (mode) => { mockCollaborationMode = mode }

// Clicks the confirm button inside the switch prompt modal by class,
// avoiding ambiguity with any invite button visible behind the overlay.
const confirmSwitch = () => fireEvent.click(document.querySelector('.delete-modal__confirm'))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Review', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockDispatch.mockReset()
    mockCollaborationMode = ''
    mockPlanChildren = []
  })

  // ─── Render ──────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderReview()
  })

  it('displays the Review & Submit Your Plan heading', () => {
    renderReview()
    expect(screen.getByText('Review & Submit Your Plan')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderReview()
    expect(screen.getByText(/Check your answers before downloading/i)).toBeInTheDocument()
  })

  it('renders the page container', () => {
    renderReview()
    expect(document.querySelector('.page-container')).toBeInTheDocument()
  })

  it('renders the Download PDF button', () => {
    renderReview()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
  })

  // ─── Legal Disclaimer ────────────────────────────────────────────────────

  it('renders the info disclaimer', () => {
    renderReview()
    expect(screen.getByTestId('disclaimer-info')).toBeInTheDocument()
  })

  it('info disclaimer mentions legal advice', () => {
    renderReview()
    expect(screen.getByTestId('disclaimer-info')).toHaveTextContent(/not.*constitute.*legal advice/i)
  })

  // ─── Section Blocks ───────────────────────────────────────────────────────

  it('renders all five known section titles', () => {
    renderReview()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Parental Rights')).toBeInTheDocument()
    expect(screen.getByText('Parenting Time & Communication')).toBeInTheDocument()
    expect(screen.getByText('Information Sharing')).toBeInTheDocument()
    expect(screen.getByText('Tax Exemptions')).toBeInTheDocument()
  })

  it('renders an Edit button for each section', () => {
    renderReview()
    // Each edit button has aria-label="Edit <Section Name>" — the leading
    // "Edit " with a trailing space distinguishes them from section toggle
    // buttons whose computed accessible names may also contain "edit"
    const editBtns = screen.getAllByRole('button', { name: /^edit /i })
    expect(editBtns.length).toBe(5)
  })

  it('all sections are expanded by default', () => {
    renderReview()
    // Each open section shows the empty state message
    const emptyMessages = screen.getAllByText('No answers recorded for this section yet.')
    expect(emptyMessages.length).toBe(5)
  })

  it('clicking a section header collapses it', async () => {
    renderReview()
    const sectionHeaders = screen.getAllByRole('button', { name: /getting started/i })
    await userEvent.click(sectionHeaders[0])
    // After collapse, empty message for that section should be gone
    // (other sections still show theirs, so count drops from 5 to 4)
    expect(screen.getAllByText('No answers recorded for this section yet.').length).toBe(4)
  })

  it('clicking a collapsed section header expands it again', async () => {
    renderReview()
    const sectionHeaders = screen.getAllByRole('button', { name: /getting started/i })
    await userEvent.click(sectionHeaders[0]) // collapse
    await userEvent.click(sectionHeaders[0]) // expand
    expect(screen.getAllByText('No answers recorded for this section yet.').length).toBe(5)
  })

  it('clicking Edit navigates to the correct route', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /edit getting started/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/getting-started')
  })

  it('clicking Edit Parental Rights navigates to the correct route', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /edit parental rights/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parental-rights')
  })

  it('clicking Edit does not toggle the section', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /edit getting started/i }))
    // All 5 sections should still be visible — Edit click should not collapse
    expect(screen.getAllByText('No answers recorded for this section yet.').length).toBe(5)
  })

  // ─── Incomplete Warning ───────────────────────────────────────────────────

  it('shows the incomplete warning disclaimer when sections have no answers', () => {
    renderReview()
    // mockPlanChildren is empty so no section is complete
    expect(screen.getByTestId('disclaimer-warning')).toBeInTheDocument()
  })

  it('incomplete disclaimer warns about court acceptance', () => {
    renderReview()
    expect(screen.getByTestId('disclaimer-warning')).toHaveTextContent(/may not be accepted by the court/i)
  })

  it('does not show the warning disclaimer when all sections are complete', () => {
    // Populate children with one response per known section so all are complete
    mockPlanChildren = Object.keys({
      getting_started: true,
      allocation_of_parental_rights_and_responsibilities: true,
      parenting_time_communication: true,
      information_sharing: true,
      tax_exemptions: true,
    }).map((section) => ({
      questionID: { section, qKey: 'q1', _id: section },
      answer: 'yes',
      isFlagged: false,
      isDeferred: false,
    }))
    renderReview()
    expect(screen.queryByTestId('disclaimer-warning')).not.toBeInTheDocument()
  })

  // ─── Section Answers ──────────────────────────────────────────────────────

  it('displays answer values when responses are populated', () => {
    mockPlanChildren = [
      {
        questionID: { section: 'getting_started', qKey: 'parentName', _id: 'gs1' },
        answer: 'Jane Doe',
        isFlagged: false,
        isDeferred: false,
      },
    ]
    renderReview()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('displays "Not answered" for empty answer values', () => {
    mockPlanChildren = [
      {
        questionID: { section: 'getting_started', qKey: 'phone', _id: 'gs2' },
        answer: '',
        isFlagged: false,
        isDeferred: false,
      },
    ]
    renderReview()
    expect(screen.getByText('Not answered')).toBeInTheDocument()
  })

  it('displays the question key alongside the answer', () => {
    mockPlanChildren = [
      {
        questionID: { section: 'getting_started', qKey: 'parentName', _id: 'gs3' },
        answer: 'Jane Doe',
        isFlagged: false,
        isDeferred: false,
      },
    ]
    renderReview()
    expect(screen.getByText('parentName')).toBeInTheDocument()
  })

  it('skips responses with unpopulated questionID', () => {
    mockPlanChildren = [
      { questionID: 'unpopulated-string-id', answer: 'should not show', isFlagged: false },
    ]
    renderReview()
    expect(screen.queryByText('should not show')).not.toBeInTheDocument()
  })

  // ─── Invite Button — mode: '' (not yet set) ───────────────────────────────

  it('shows "Switch & Invite Co-Parent" button when mode is not set', () => {
    setMode('')
    renderReview()
    expect(screen.getByRole('button', { name: /switch & invite co-parent/i })).toBeInTheDocument()
  })

  it('opens switch prompt when invite is clicked with mode not set', async () => {
    setMode('')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    expect(screen.getByText('Switch to collaborative mode?')).toBeInTheDocument()
  })

  // ─── Invite Button — mode: 'collaborative' ────────────────────────────────

  it('shows "Invite Co-Parent" button in collaborative mode', () => {
    setMode('collaborative')
    renderReview()
    expect(screen.getByRole('button', { name: /^invite co-parent$/i })).toBeInTheDocument()
  })

  it('opens the invite modal directly in collaborative mode', async () => {
    setMode('collaborative')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /^invite co-parent$/i }))
    expect(screen.getByRole('dialog', { name: /invite modal/i })).toBeInTheDocument()
  })

  it('does not show the switch prompt in collaborative mode', async () => {
    setMode('collaborative')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /^invite co-parent$/i }))
    expect(screen.queryByText('Switch to collaborative mode?')).not.toBeInTheDocument()
  })

  // ─── Invite Button — mode: 'individual' ──────────────────────────────────

  it('shows "Switch & Invite Co-Parent" button in individual mode', () => {
    setMode('individual')
    renderReview()
    expect(screen.getByRole('button', { name: /switch & invite co-parent/i })).toBeInTheDocument()
  })

  it('opens switch prompt when invite is clicked in individual mode', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    expect(screen.getByText('Switch to collaborative mode?')).toBeInTheDocument()
  })

  it('does not open the invite modal directly in individual mode', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    expect(screen.queryByRole('dialog', { name: /invite modal/i })).not.toBeInTheDocument()
  })

  // ─── Invite Button — mode: 'locked-individual' ───────────────────────────

  it('hides the invite button entirely in locked-individual mode', () => {
    setMode('locked-individual')
    renderReview()
    expect(screen.queryByRole('button', { name: /invite/i })).not.toBeInTheDocument()
  })

  it('still shows the Download PDF button in locked-individual mode', () => {
    setMode('locked-individual')
    renderReview()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
  })

  // ─── Switch Prompt ────────────────────────────────────────────────────────

  it('switch prompt is not visible on initial render', () => {
    setMode('individual')
    renderReview()
    expect(screen.queryByText('Switch to collaborative mode?')).not.toBeInTheDocument()
  })

  it('switch prompt shows the correct description', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    expect(screen.getByText(/You're currently completing this plan individually/i)).toBeInTheDocument()
  })

  it('closes the switch prompt when "Stay in individual mode" is clicked', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    await userEvent.click(screen.getByRole('button', { name: /stay in individual mode/i }))
    expect(screen.queryByText('Switch to collaborative mode?')).not.toBeInTheDocument()
  })

  it('closes the switch prompt when the overlay is clicked', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    fireEvent.click(document.querySelector('.delete-modal__overlay'))
    expect(screen.queryByText('Switch to collaborative mode?')).not.toBeInTheDocument()
  })

  it('does not dispatch when staying in individual mode', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    await userEvent.click(screen.getByRole('button', { name: /stay in individual mode/i }))
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('dispatches collaborationMode update when switch is confirmed', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    confirmSwitch()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SECTION',
      section: 'collaborationMode',
      payload: 'collaborative',
    })
  })

  it('opens the invite modal after confirming the switch', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    confirmSwitch()
    expect(screen.getByRole('dialog', { name: /invite modal/i })).toBeInTheDocument()
  })

  it('closes the switch prompt after confirming', async () => {
    setMode('individual')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /switch & invite co-parent/i }))
    confirmSwitch()
    expect(screen.queryByText('Switch to collaborative mode?')).not.toBeInTheDocument()
  })

  // ─── Invite Modal ─────────────────────────────────────────────────────────

  it('invite modal is not shown on initial render', () => {
    renderReview()
    expect(screen.queryByRole('dialog', { name: /invite modal/i })).not.toBeInTheDocument()
  })

  it('closes the invite modal when dismissed', async () => {
    setMode('collaborative')
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /^invite co-parent$/i }))
    await userEvent.click(screen.getByRole('button', { name: /close invite modal/i }))
    expect(screen.queryByRole('dialog', { name: /invite modal/i })).not.toBeInTheDocument()
  })
})