import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ParentalRights from '../../src/pages/ParentalRights'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock scrollIntoView — not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Helper: query the error element scoped to a section class
const getSectionError = (sectionClass) =>
  document.querySelector(`.${sectionClass} ~ * .radio-group-error`) ??
  document.querySelector(`.${sectionClass} .radio-group-error`)

describe('ParentalRights', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<ParentalRights />)
  })

  it('displays the Parental Rights heading', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('Parental Rights')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<ParentalRights />)
    expect(
      screen.getByText(/Define where your children live and who will make legal decisions/i)
    ).toBeInTheDocument()
  })

  it('displays the required fields note', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText(/Fields marked with/i)).toBeInTheDocument()
  })

  // ─── Section Rendering ────────────────────────────────────────────────────

  it('displays the Applies to All Children section', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('Applies to All Children?')).toBeInTheDocument()
    expect(screen.getByText('Simplify by applying answers to all children.')).toBeInTheDocument()
  })

  it('displays the Living Arrangements section', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('Living Arrangements')).toBeInTheDocument()
    expect(screen.getByText('Where will your children live?')).toBeInTheDocument()
  })

  it('displays the Legal Decision Making section', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('Legal Decision Making')).toBeInTheDocument()
    expect(screen.getByText('Who makes important decisions?')).toBeInTheDocument()
  })

  // ─── Applies to All Children ──────────────────────────────────────────────

  it('displays the applies to all children question', () => {
    renderWithRouter(<ParentalRights />)
    expect(
      screen.getByText(/Will your answers apply to all of your children/i)
    ).toBeInTheDocument()
  })

  it('renders all four appliesToAllChildren radio options', () => {
    renderWithRouter(<ParentalRights />)
    expect(document.querySelector('input[name="appliesToAllChildren"][value="yes"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="appliesToAllChildren"][value="no"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="appliesToAllChildren"][value="needMoreInfo"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="appliesToAllChildren"][value="defaultToCoParent"]')).toBeInTheDocument()
  })

  it('displays correct labels for appliesToAllChildren options', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('My answers will be the same for all children')).toBeInTheDocument()
    expect(screen.getByText('I need to answer separately for each child')).toBeInTheDocument()
  })

  it('no appliesToAllChildren radio is checked by default', () => {
    renderWithRouter(<ParentalRights />)
    ;['yes', 'no', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="appliesToAllChildren"][value="${value}"]`)).not.toBeChecked()
    })
  })

  it('can select "Yes" for appliesToAllChildren', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="appliesToAllChildren"][value="yes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No" for appliesToAllChildren', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="appliesToAllChildren"][value="no"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "I need more information" for appliesToAllChildren', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="appliesToAllChildren"][value="needMoreInfo"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Default to my co-parent\'s choice" for appliesToAllChildren', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="appliesToAllChildren"][value="defaultToCoParent"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new option for appliesToAllChildren deselects the previous one', async () => {
    renderWithRouter(<ParentalRights />)
    const yes = document.querySelector('input[name="appliesToAllChildren"][value="yes"]')
    const no = document.querySelector('input[name="appliesToAllChildren"][value="no"]')
    await userEvent.click(yes)
    await userEvent.click(no)
    expect(no).toBeChecked()
    expect(yes).not.toBeChecked()
  })

  // ─── Living Arrangements ──────────────────────────────────────────────────

  it('displays the living arrangements question', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText(/Do you want your children to live with you/i)).toBeInTheDocument()
  })

  it('renders all five livingArrangements radio options', () => {
    renderWithRouter(<ParentalRights />)
    ;['parent1FullTime', 'parent1Occasional', 'parent1VisitingOnly', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="livingArrangements"][value="${value}"]`)).toBeInTheDocument()
    })
  })

  it('displays correct labels for living arrangements options', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('Yes, all the time')).toBeInTheDocument()
    expect(screen.getByText('Yes, on occasion')).toBeInTheDocument()
    expect(screen.getByText('No, I just want visiting time')).toBeInTheDocument()
  })

  it('no livingArrangements radio is checked by default', () => {
    renderWithRouter(<ParentalRights />)
    ;['parent1FullTime', 'parent1Occasional', 'parent1VisitingOnly', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="livingArrangements"][value="${value}"]`)).not.toBeChecked()
    })
  })

  it('can select "Yes, all the time" for living arrangements', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="livingArrangements"][value="parent1FullTime"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Yes, on occasion" for living arrangements', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="livingArrangements"][value="parent1Occasional"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No, I just want visiting time"', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="livingArrangements"][value="parent1VisitingOnly"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new livingArrangements option deselects the previous one', async () => {
    renderWithRouter(<ParentalRights />)
    const full = document.querySelector('input[name="livingArrangements"][value="parent1FullTime"]')
    const visiting = document.querySelector('input[name="livingArrangements"][value="parent1VisitingOnly"]')
    await userEvent.click(full)
    await userEvent.click(visiting)
    expect(visiting).toBeChecked()
    expect(full).not.toBeChecked()
  })

  // ─── Legal Decision Making ────────────────────────────────────────────────

  it('displays the legal decision making question', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText(/Do you want to make legal decisions for your children/i)).toBeInTheDocument()
  })

  it('renders all five decisionMaking radio options', () => {
    renderWithRouter(<ParentalRights />)
    ;['parent1Sole', 'jointWithCoParent', 'noLegalDecisionMaking', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="decisionMaking"][value="${value}"]`)).toBeInTheDocument()
    })
  })

  it('displays correct labels for decision making options', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByText('Yes, by myself')).toBeInTheDocument()
    expect(screen.getByText('Yes, with my co-parent')).toBeInTheDocument()
  })

  it('no decisionMaking radio is checked by default', () => {
    renderWithRouter(<ParentalRights />)
    ;['parent1Sole', 'jointWithCoParent', 'noLegalDecisionMaking', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="decisionMaking"][value="${value}"]`)).not.toBeChecked()
    })
  })

  it('can select "Yes, by myself" for decision making', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="decisionMaking"][value="parent1Sole"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Yes, with my co-parent" for decision making', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="decisionMaking"][value="jointWithCoParent"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No" for decision making', async () => {
    renderWithRouter(<ParentalRights />)
    const radio = document.querySelector('input[name="decisionMaking"][value="noLegalDecisionMaking"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new decisionMaking option deselects the previous one', async () => {
    renderWithRouter(<ParentalRights />)
    const sole = document.querySelector('input[name="decisionMaking"][value="parent1Sole"]')
    const joint = document.querySelector('input[name="decisionMaking"][value="jointWithCoParent"]')
    await userEvent.click(sole)
    await userEvent.click(joint)
    expect(joint).toBeChecked()
    expect(sole).not.toBeChecked()
  })

  // ─── Cross-section independence ───────────────────────────────────────────

  it('selecting an option in one section does not affect other sections', async () => {
    renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="yes"]'))
    ;['parent1FullTime', 'parent1Occasional', 'parent1VisitingOnly', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="livingArrangements"][value="${value}"]`)).not.toBeChecked()
    })
    ;['parent1Sole', 'jointWithCoParent', 'noLegalDecisionMaking', 'needMoreInfo', 'defaultToCoParent'].forEach(value => {
      expect(document.querySelector(`input[name="decisionMaking"][value="${value}"]`)).not.toBeChecked()
    })
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('does not show errors before the form is submitted', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(0)
  })

  it('shows all three errors when Next is clicked with nothing selected', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const errors = await screen.findAllByText('Please select an option to continue')
    expect(errors).toHaveLength(3)
  })

  it('shows the appliesToAllChildren error in the correct section', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    expect(
      document.querySelector('.children-application-section ~ * .radio-group-error')
    ).toBeInTheDocument()
  })

  it('shows the livingArrangements error in the correct section', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    expect(
      document.querySelector('.living-arrangements-section ~ * .radio-group-error')
    ).toBeInTheDocument()
  })

  it('shows the decisionMaking error in the correct section', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    expect(
      document.querySelector('.decision-making-section ~ * .radio-group-error')
    ).toBeInTheDocument()
  })

  it('clears the appliesToAllChildren error after selecting an option', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="yes"]'))
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(2)
  })

  it('clears the livingArrangements error after selecting an option', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    await userEvent.click(document.querySelector('input[name="livingArrangements"][value="parent1FullTime"]'))
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(2)
  })

  it('clears the decisionMaking error after selecting an option', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    await userEvent.click(document.querySelector('input[name="decisionMaking"][value="parent1Sole"]'))
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(2)
  })

  it('does not navigate when Next is clicked with nothing selected', async () => {
    renderWithRouter(<ParentalRights />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when only one section is filled', async () => {
    renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="yes"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when two of three sections are filled', async () => {
    renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="yes"]'))
    await userEvent.click(document.querySelector('input[name="livingArrangements"][value="parent1FullTime"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ─── Footer Navigation ────────────────────────────────────────────────────

  it('renders the Next and Back buttons', () => {
    renderWithRouter(<ParentalRights />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to /getting-started when Back is clicked', async () => {
    renderWithRouter(<ParentalRights />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/getting-started')
  })

  it('navigates to /parenting-time-communication on valid form submission', async () => {
    renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="yes"]'))
    await userEvent.click(document.querySelector('input[name="livingArrangements"][value="parent1FullTime"]'))
    await userEvent.click(document.querySelector('input[name="decisionMaking"][value="jointWithCoParent"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
  })

  it('navigates correctly regardless of which valid options are chosen', async () => {
    renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="needMoreInfo"]'))
    await userEvent.click(document.querySelector('input[name="livingArrangements"][value="defaultToCoParent"]'))
    await userEvent.click(document.querySelector('input[name="decisionMaking"][value="noLegalDecisionMaking"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
  })

  // ─── Global State / Persistence ───────────────────────────────────────────

  it('persists appliesToAllChildren selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="appliesToAllChildren"][value="yes"]'))
    unmount()
    renderWithRouter(<ParentalRights />)
    expect(document.querySelector('input[name="appliesToAllChildren"][value="yes"]')).toBeChecked()
  })

  it('persists livingArrangements selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="livingArrangements"][value="parent1Occasional"]'))
    unmount()
    renderWithRouter(<ParentalRights />)
    expect(document.querySelector('input[name="livingArrangements"][value="parent1Occasional"]')).toBeChecked()
  })

  it('persists decisionMaking selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentalRights />)
    await userEvent.click(document.querySelector('input[name="decisionMaking"][value="jointWithCoParent"]'))
    unmount()
    renderWithRouter(<ParentalRights />)
    expect(document.querySelector('input[name="decisionMaking"][value="jointWithCoParent"]')).toBeChecked()
  })
})