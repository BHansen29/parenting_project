import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import HouseholdInfo from '../../src/pages/HouseholdInfo'
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

describe('HouseholdInfo', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<HouseholdInfo />)
  })

  it('displays the Household Information heading', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText('Household Information')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText(/Enter the details of the parents and children/i)).toBeInTheDocument()
  })

  it('displays the ShareCare logo in the header', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByAltText('ShareCare')).toBeInTheDocument()
  })

  it('displays the step indicator in the header', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText(/step \d+ of \d+/i)).toBeInTheDocument()
  })

  // ─── Parents Section ──────────────────────────────────────────────────────

  it('displays the Parents section heading and description', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText('Parents')).toBeInTheDocument()
    expect(screen.getByText(/individuals entering into this parenting agreement/i)).toBeInTheDocument()
  })

  it('renders Parent 1 first and last name fields', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByLabelText(/parent 1 first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/parent 1 last name/i)).toBeInTheDocument()
  })

  it('renders Parent 2 first and last name fields', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByLabelText(/parent 2 first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/parent 2 last name/i)).toBeInTheDocument()
  })

  it('accepts input in Parent 1 first name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('firstParentFirstName'), 'Jane')
    expect(document.getElementById('firstParentFirstName')).toHaveValue('Jane')
  })

  it('accepts input in Parent 1 last name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('firstParentLastName'), 'Smith')
    expect(document.getElementById('firstParentLastName')).toHaveValue('Smith')
  })

  it('accepts input in Parent 2 first name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('secondParentFirstName'), 'John')
    expect(document.getElementById('secondParentFirstName')).toHaveValue('John')
  })

  it('accepts input in Parent 2 last name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('secondParentLastName'), 'Smith')
    expect(document.getElementById('secondParentLastName')).toHaveValue('Smith')
  })

  // ─── Children Section ─────────────────────────────────────────────────────

  it('displays the Children section heading and description', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByText(/children covered by this parenting agreement/i)).toBeInTheDocument()
  })

  it('renders one child section by default', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.queryByText('Child 2')).not.toBeInTheDocument()
  })

  it('renders first name, last name, and date of birth fields for the default child', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(document.getElementById('child-1-firstName')).toBeInTheDocument()
    expect(document.getElementById('child-1-lastName')).toBeInTheDocument()
    expect(document.getElementById('child-1-dateOfBirth')).toBeInTheDocument()
  })

  it('accepts input in child first name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('child-1-firstName'), 'Baby')
    expect(document.getElementById('child-1-firstName')).toHaveValue('Baby')
  })

  it('accepts input in child last name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('child-1-lastName'), 'Smith')
    expect(document.getElementById('child-1-lastName')).toHaveValue('Smith')
  })

  it('accepts a date of birth value', () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.change(document.getElementById('child-1-dateOfBirth'), {
      target: { value: '2020-01-01' }
    })
    expect(document.getElementById('child-1-dateOfBirth')).toHaveValue('2020-01-01')
  })

  // ─── Child Classification ─────────────────────────────────────────────────

  it('renders both child classification radio options', () => {
    renderWithRouter(<HouseholdInfo />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('defaults child classification to minor', () => {
    renderWithRouter(<HouseholdInfo />)
    const [minorRadio, emancipatedRadio] = screen.getAllByRole('radio')
    expect(minorRadio).toBeChecked()
    expect(emancipatedRadio).not.toBeChecked()
  })

  it('displays the minor classification description text', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText(/minor and\/or mentally or physically disabled/i)).toBeInTheDocument()
  })

  it('displays the emancipated classification description text', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText(/emancipated adult/i)).toBeInTheDocument()
  })

  it('can change classification to emancipated', async () => {
    renderWithRouter(<HouseholdInfo />)
    const [minorRadio, emancipatedRadio] = screen.getAllByRole('radio')
    await userEvent.click(emancipatedRadio)
    expect(emancipatedRadio).toBeChecked()
    expect(minorRadio).not.toBeChecked()
  })

  it('can switch classification back to minor', async () => {
    renderWithRouter(<HouseholdInfo />)
    const [minorRadio, emancipatedRadio] = screen.getAllByRole('radio')
    await userEvent.click(emancipatedRadio)
    await userEvent.click(minorRadio)
    expect(minorRadio).toBeChecked()
    expect(emancipatedRadio).not.toBeChecked()
  })

  // ─── Add / Remove Children ────────────────────────────────────────────────

  it('renders the Add Another Child button', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByRole('button', { name: /add another child/i })).toBeInTheDocument()
  })

  it('adds a second child when Add Another Child is clicked', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('adds independent fields for each child', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(document.getElementById('child-1-firstName')).toBeInTheDocument()
    expect(document.getElementById('child-2-firstName')).toBeInTheDocument()
    expect(document.getElementById('child-1-lastName')).toBeInTheDocument()
    expect(document.getElementById('child-2-lastName')).toBeInTheDocument()
    expect(document.getElementById('child-1-dateOfBirth')).toBeInTheDocument()
    expect(document.getElementById('child-2-dateOfBirth')).toBeInTheDocument()
  })

  it('each child gets their own independent classification radio buttons', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('does not show Remove button when only one child exists', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.queryByRole('button', { name: /remove child 1/i })).not.toBeInTheDocument()
  })

  it('shows Remove button on all children when more than one exists', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(screen.getByRole('button', { name: /remove child 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove child 2/i })).toBeInTheDocument()
  })

  it('removes the correct child when Remove is clicked', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    await userEvent.click(screen.getByRole('button', { name: /remove child 2/i }))
    expect(screen.queryByText('Child 2')).not.toBeInTheDocument()
    expect(screen.getByText('Child 1')).toBeInTheDocument()
  })

  it('hides Remove button again after returning to one child', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    await userEvent.click(screen.getByRole('button', { name: /remove child 2/i }))
    expect(screen.queryByRole('button', { name: /remove child 1/i })).not.toBeInTheDocument()
  })

  it('can add three children', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('shows all required field errors when submitting empty form', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Parent 1 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Parent 1 last name is required')).toBeInTheDocument()
    expect(await screen.findByText('Parent 2 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Parent 2 last name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 last name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 date of birth is required')).toBeInTheDocument()
  })

  it('shows error when Parent 1 first name is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Parent 1 first name is required')).toBeInTheDocument()
  })

  it('shows error when Parent 1 last name is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Parent 1 last name is required')).toBeInTheDocument()
  })

  it('shows error when Parent 2 first name is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Parent 2 first name is required')).toBeInTheDocument()
  })

  it('shows error when Parent 2 last name is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Parent 2 last name is required')).toBeInTheDocument()
  })

  it('shows error when child first name is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 first name is required')).toBeInTheDocument()
  })

  it('shows error when child last name is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 last name is required')).toBeInTheDocument()
  })

  it('shows error when child date of birth is missing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 date of birth is required')).toBeInTheDocument()
  })

  it('clears Parent 1 first name error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Parent 1 first name is required')
    await userEvent.type(document.getElementById('firstParentFirstName'), 'Jane')
    expect(screen.queryByText('Parent 1 first name is required')).not.toBeInTheDocument()
  })

  it('clears Parent 1 last name error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Parent 1 last name is required')
    await userEvent.type(document.getElementById('firstParentLastName'), 'Smith')
    expect(screen.queryByText('Parent 1 last name is required')).not.toBeInTheDocument()
  })

  it('clears Parent 2 first name error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Parent 2 first name is required')
    await userEvent.type(document.getElementById('secondParentFirstName'), 'John')
    expect(screen.queryByText('Parent 2 first name is required')).not.toBeInTheDocument()
  })

  it('clears Parent 2 last name error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Parent 2 last name is required')
    await userEvent.type(document.getElementById('secondParentLastName'), 'Smith')
    expect(screen.queryByText('Parent 2 last name is required')).not.toBeInTheDocument()
  })

  it('clears child first name error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Child 1 first name is required')
    await userEvent.type(document.getElementById('child-1-firstName'), 'Baby')
    expect(screen.queryByText('Child 1 first name is required')).not.toBeInTheDocument()
  })

  it('clears child last name error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Child 1 last name is required')
    await userEvent.type(document.getElementById('child-1-lastName'), 'Smith')
    expect(screen.queryByText('Child 1 last name is required')).not.toBeInTheDocument()
  })

  it('shows validation errors for all children on empty submit', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 2 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 last name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 2 last name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 date of birth is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 2 date of birth is required')).toBeInTheDocument()
  })

  it('does not navigate when Next is clicked with empty form', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ─── Footer Navigation ────────────────────────────────────────────────────

  it('renders the Next and Back buttons in the footer', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to /landing-page when Back is clicked', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/landing-page')
  })

  it('navigates to /custody-schedule on valid form submission', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('firstParentFirstName'), 'Jane')
    await userEvent.type(document.getElementById('firstParentLastName'), 'Smith')
    await userEvent.type(document.getElementById('secondParentFirstName'), 'John')
    await userEvent.type(document.getElementById('secondParentLastName'), 'Smith')
    await userEvent.type(document.getElementById('child-1-firstName'), 'Baby')
    await userEvent.type(document.getElementById('child-1-lastName'), 'Smith')
    fireEvent.change(document.getElementById('child-1-dateOfBirth'), {
      target: { value: '2020-01-01' }
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/custody-schedule')
  })

  // ─── Global State Management ──────────────────────────────────────────────

  it('saves parent data to context on valid form submission', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('firstParentFirstName'), 'Jane')
    await userEvent.type(document.getElementById('firstParentLastName'), 'Smith')
    await userEvent.type(document.getElementById('secondParentFirstName'), 'John')
    await userEvent.type(document.getElementById('secondParentLastName'), 'Smith')
    await userEvent.type(document.getElementById('child-1-firstName'), 'Baby')
    await userEvent.type(document.getElementById('child-1-lastName'), 'Smith')
    fireEvent.change(document.getElementById('child-1-dateOfBirth'), {
      target: { value: '2020-01-01' }
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/custody-schedule')
  })

  it('persists parent data when returning to the page', async () => {
    const { unmount } = renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('firstParentFirstName'), 'Jane')
    await userEvent.type(document.getElementById('firstParentLastName'), 'Smith')
    unmount()
    renderWithRouter(<HouseholdInfo />)
    expect(document.getElementById('firstParentFirstName')).toHaveValue('Jane')
    expect(document.getElementById('firstParentLastName')).toHaveValue('Smith')
  })

  it('persists child data to context when Next is clicked', async () => {
    const { unmount } = renderWithRouter(<HouseholdInfo />)
    await userEvent.type(document.getElementById('firstParentFirstName'), 'Jane')
    await userEvent.type(document.getElementById('firstParentLastName'), 'Smith')
    await userEvent.type(document.getElementById('secondParentFirstName'), 'John')
    await userEvent.type(document.getElementById('secondParentLastName'), 'Smith')
    await userEvent.type(document.getElementById('child-1-firstName'), 'Baby')
    await userEvent.type(document.getElementById('child-1-lastName'), 'Smith')
    fireEvent.change(document.getElementById('child-1-dateOfBirth'), {
      target: { value: '2020-01-01' }
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    unmount()
    renderWithRouter(<HouseholdInfo />)
    expect(document.getElementById('child-1-firstName')).toHaveValue('Baby')
  })
})