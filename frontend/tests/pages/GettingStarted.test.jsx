import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import GettingStarted from '../../src/pages/GettingStarted'
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

describe('GettingStarted', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<GettingStarted />)
  })

  it('displays the Getting Started heading', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<GettingStarted />)
    expect(
      screen.getByText(/Let's start by gathering some basic information/i)
    ).toBeInTheDocument()
  })

  it('displays the required fields note', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText(/Fields marked with/i)).toBeInTheDocument()
  })

  // ─── Section Rendering ────────────────────────────────────────────────────

  it('displays the Safety & Privacy section', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Safety & Privacy')).toBeInTheDocument()
    expect(screen.getByText('Your safety is our priority.')).toBeInTheDocument()
  })

  it('displays the Your Information section', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Your Information')).toBeInTheDocument()
    expect(screen.getByText('Please provide your contact details.')).toBeInTheDocument()
  })

  it('displays the Case Filing Status section', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Case Filing Status')).toBeInTheDocument()
    expect(screen.getByText("Help us understand your legal situation.")).toBeInTheDocument()
  })

  it('displays the Your Children section', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Your Children')).toBeInTheDocument()
    expect(
      screen.getByText(/Please list the children you are including/i)
    ).toBeInTheDocument()
  })

  // ─── Safety & Privacy ─────────────────────────────────────────────────────

  it('displays the safety concern question', () => {
    renderWithRouter(<GettingStarted />)
    expect(
      screen.getByText(/Would sharing information from this questionnaire with your co-parent make you fear for your safety/i)
    ).toBeInTheDocument()
  })

  it('renders both safety concern radio options', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="safetyConcern"][value="yes"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="safetyConcern"][value="no"]')).toBeInTheDocument()
  })

  it('displays correct labels for safety concern options', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Yes, please keep my information private')).toBeInTheDocument()
    expect(screen.getByText('No, I wish to collaborate with my co-parent')).toBeInTheDocument()
  })

  it('displays descriptions for safety concern options', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('You and your co-parent will fill out the form separately')).toBeInTheDocument()
    expect(screen.getByText('Your answers will be shared with your co-parent')).toBeInTheDocument()
  })

  it('no safety concern radio is checked by default', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="safetyConcern"][value="yes"]')).not.toBeChecked()
    expect(document.querySelector('input[name="safetyConcern"][value="no"]')).not.toBeChecked()
  })

  it('can select "Yes" for safety concern', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="safetyConcern"][value="yes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No" for safety concern', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="safetyConcern"][value="no"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting "No" deselects "Yes" for safety concern', async () => {
    renderWithRouter(<GettingStarted />)
    const yes = document.querySelector('input[name="safetyConcern"][value="yes"]')
    const no = document.querySelector('input[name="safetyConcern"][value="no"]')
    await userEvent.click(yes)
    await userEvent.click(no)
    expect(no).toBeChecked()
    expect(yes).not.toBeChecked()
  })

  // ─── Your Information ─────────────────────────────────────────────────────

  it('renders the First Name input', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('#firstParentFirstName')).toBeInTheDocument()
  })

  it('renders the Last Name input', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('#firstParentLastName')).toBeInTheDocument()
  })

  it('renders the Phone Number input', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument()
  })

  it('renders the Address input', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument()
  })

  it('can type into the First Name input', async () => {
    renderWithRouter(<GettingStarted />)
    const input = document.querySelector('#firstParentFirstName')
    await userEvent.type(input, 'Jane')
    expect(input).toHaveValue('Jane')
  })

  it('can type into the Last Name input', async () => {
    renderWithRouter(<GettingStarted />)
    const input = document.querySelector('#firstParentLastName')
    await userEvent.type(input, 'Doe')
    expect(input).toHaveValue('Doe')
  })

  it('can type into the Phone Number input', async () => {
    renderWithRouter(<GettingStarted />)
    const input = screen.getByLabelText(/Phone Number/i)
    await userEvent.type(input, '555-555-5555')
    expect(input).toHaveValue('555-555-5555')
  })

  it('can type into the Address input', async () => {
    renderWithRouter(<GettingStarted />)
    const input = screen.getByLabelText(/Address/i)
    await userEvent.type(input, '123 Main St')
    expect(input).toHaveValue('123 Main St')
  })

  // ─── Case Filing Status ───────────────────────────────────────────────────

  it('displays the case filing question', () => {
    renderWithRouter(<GettingStarted />)
    expect(
      screen.getByText(/Did you file the divorce, separation, or child custody case/i)
    ).toBeInTheDocument()
  })

  it('renders all four case filing status options', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="caseFilingStatus"][value="yes"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="caseFilingStatus"][value="no"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="caseFilingStatus"][value="flagged"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="caseFilingStatus"][value="defer"]')).toBeInTheDocument()
  })

  it('displays correct labels for case filing options', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Yes, it was me')).toBeInTheDocument()
    expect(screen.getByText('No, my co-parent filed')).toBeInTheDocument()
    expect(screen.getByText('I need more information')).toBeInTheDocument()
    expect(screen.getByText('Defer to co-parent')).toBeInTheDocument()
  })

  it('no case filing status radio is checked by default', () => {
    renderWithRouter(<GettingStarted />)
    ;['yes', 'no', 'flagged', 'defer'].forEach(value => {
      expect(document.querySelector(`input[name="caseFilingStatus"][value="${value}"]`)).not.toBeChecked()
    })
  })

  it('can select "Yes, it was me" for case filing status', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="caseFilingStatus"][value="yes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No, my co-parent filed"', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="caseFilingStatus"][value="no"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "I need more information" for case filing status', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="caseFilingStatus"][value="flagged"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Defer to co-parent" for case filing status', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="caseFilingStatus"][value="defer"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new case filing option deselects the previous one', async () => {
    renderWithRouter(<GettingStarted />)
    const yes = document.querySelector('input[name="caseFilingStatus"][value="yes"]')
    const no = document.querySelector('input[name="caseFilingStatus"][value="no"]')
    await userEvent.click(yes)
    await userEvent.click(no)
    expect(no).toBeChecked()
    expect(yes).not.toBeChecked()
  })

  // ─── Children Section ─────────────────────────────────────────────────────

  it('renders one child card by default', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.queryByText('Child 2')).not.toBeInTheDocument()
  })

  it('renders child First Name and Last Name fields', () => {
    renderWithRouter(<GettingStarted />)
    // There are parent + child name fields; ensure at least two of each
    expect(screen.getAllByLabelText(/First Name/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByLabelText(/Last Name/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the Date of Birth field for the first child', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument()
  })

  it('renders child classification radio buttons', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="child-1-classification"][value="minor"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="child-1-classification"][value="emancipated"]')).toBeInTheDocument()
  })

  it('displays the child classification label text', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('Child Classification')).toBeInTheDocument()
  })

  it('displays the minor classification description', () => {
    renderWithRouter(<GettingStarted />)
    expect(
      screen.getByText(/The child is a minor and\/or mentally or physically disabled/i)
    ).toBeInTheDocument()
  })

  it('displays the emancipated classification description', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByText('The child is an emancipated adult')).toBeInTheDocument()
  })

  it('no child classification is checked by default', () => {
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="child-1-classification"][value="minor"]')).not.toBeChecked()
    expect(document.querySelector('input[name="child-1-classification"][value="emancipated"]')).not.toBeChecked()
  })

  it('can select "minor" classification for child 1', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="child-1-classification"][value="minor"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "emancipated" classification for child 1', async () => {
    renderWithRouter(<GettingStarted />)
    const radio = document.querySelector('input[name="child-1-classification"][value="emancipated"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('does not show Remove button when there is only one child', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.queryByRole('button', { name: /remove child 1/i })).not.toBeInTheDocument()
  })

  it('shows the Add Another Child button', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByRole('button', { name: /add another child/i })).toBeInTheDocument()
  })

  it('adds a second child card when Add Another Child is clicked', async () => {
    renderWithRouter(<GettingStarted />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('shows Remove buttons when there are two children', async () => {
    renderWithRouter(<GettingStarted />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(screen.getByRole('button', { name: /remove child 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove child 2/i })).toBeInTheDocument()
  })

  it('removes a child card when the Remove button is clicked', async () => {
    renderWithRouter(<GettingStarted />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    await userEvent.click(screen.getByRole('button', { name: /remove child 2/i }))
    expect(screen.queryByText('Child 2')).not.toBeInTheDocument()
    expect(screen.getByText('Child 1')).toBeInTheDocument()
  })

  it('cannot remove the last remaining child', async () => {
    renderWithRouter(<GettingStarted />)
    // Only one child — Remove button should not appear
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('renders classification radios for a newly added child', async () => {
    renderWithRouter(<GettingStarted />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(document.querySelector('input[name="child-2-classification"][value="minor"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="child-2-classification"][value="emancipated"]')).toBeInTheDocument()
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('does not show errors before the form is submitted', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.queryByText('Please select an option to continue')).not.toBeInTheDocument()
    expect(screen.queryByText('First name is required')).not.toBeInTheDocument()
  })

  it('shows safety concern error when Next is clicked with no safety selection', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const errors = await screen.findAllByText('Please select an option to continue')
    expect(errors.length).toBeGreaterThanOrEqual(1)
    const safetySection = document.querySelector('.safety-privacy-section')
    expect(safetySection.querySelector('.radio-group-error')).toBeInTheDocument()
  })

  it('shows parent first name error when Next is clicked with empty first name', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('First name is required')).toBeInTheDocument()
  })

  it('shows parent last name error when Next is clicked with empty last name', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Last name is required')).toBeInTheDocument()
  })

  it('shows phone number error when Next is clicked with empty phone', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Phone number is required')).toBeInTheDocument()
  })

  it('shows address error when Next is clicked with empty address', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Address is required')).toBeInTheDocument()
  })

  it('shows child first name error when Next is clicked with empty child first name', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 first name is required')).toBeInTheDocument()
  })

  it('shows child last name error when Next is clicked with empty child last name', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 last name is required')).toBeInTheDocument()
  })

  it('shows child date of birth error when Next is clicked with no date of birth', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 date of birth is required')).toBeInTheDocument()
  })

  it('shows child classification error when Next is clicked with no classification', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 classification is required')).toBeInTheDocument()
  })

  it('clears the safety concern error after selecting an option', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    await userEvent.click(document.querySelector('input[name="safetyConcern"][value="no"]'))
    const safetySection = document.querySelector('.safety-privacy-section')
    expect(safetySection.querySelector('.radio-group-error')).not.toBeInTheDocument()
  })

  it('clears the first name error after typing in the field', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('First name is required')
    await userEvent.type(document.querySelector('#firstParentFirstName'), 'Jane')
    expect(screen.queryByText('First name is required')).not.toBeInTheDocument()
  })

  it('does not navigate when Next is clicked with an empty form', async () => {
    renderWithRouter(<GettingStarted />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ─── Footer Navigation ────────────────────────────────────────────────────

  it('renders the Next and Back buttons', () => {
    renderWithRouter(<GettingStarted />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to "/" when Back is clicked', async () => {
    renderWithRouter(<GettingStarted />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('navigates to /parental-rights on valid form submission', async () => {
    renderWithRouter(<GettingStarted />)

    // Safety concern
    await userEvent.click(document.querySelector('input[name="safetyConcern"][value="no"]'))

    // Parent info
    await userEvent.type(document.querySelector('#firstParentFirstName'), 'Jane')
    await userEvent.type(document.querySelector('#firstParentLastName'), 'Doe')
    await userEvent.type(document.querySelector('#firstParentPhone'), '555-555-5555')
    await userEvent.type(document.querySelector('#firstParentAddress'), '123 Main St, Columbus, OH 43215')

    // Case filing
    await userEvent.click(document.querySelector('input[name="caseFilingStatus"][value="yes"]'))

    // Child info — find child-specific fields by ID
    await userEvent.type(document.querySelector('#child-1-firstName'), 'Alex')
    await userEvent.type(document.querySelector('#child-1-lastName'), 'Doe')
    fireEvent.change(document.querySelector('#child-1-dateOfBirth'), { target: { value: '2015-06-15' } })
    await userEvent.click(document.querySelector('input[name="child-1-classification"][value="minor"]'))

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parental-rights')
  })

  // ─── Global State / Persistence ───────────────────────────────────────────

  it('persists safety concern selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<GettingStarted />)
    await userEvent.click(document.querySelector('input[name="safetyConcern"][value="yes"]'))
    unmount()
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="safetyConcern"][value="yes"]')).toBeChecked()
  })

  it('persists case filing status selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<GettingStarted />)
    await userEvent.click(document.querySelector('input[name="caseFilingStatus"][value="no"]'))
    unmount()
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('input[name="caseFilingStatus"][value="no"]')).toBeChecked()
  })

  it('persists parent first name when returning to the page', async () => {
    const { unmount } = renderWithRouter(<GettingStarted />)
    await userEvent.type(document.querySelector('#firstParentFirstName'), 'Jane')
    unmount()
    renderWithRouter(<GettingStarted />)
    expect(document.querySelector('#firstParentFirstName')).toHaveValue('Jane')
  })
})