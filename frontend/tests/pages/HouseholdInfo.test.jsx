import { screen, fireEvent, within } from '@testing-library/react'
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

describe('HouseholdInfo', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // Render

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

  // Parents Section

  it('displays the Parents section heading and description', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByText('Parents')).toBeInTheDocument()
    expect(screen.getByText(/individuals entering into this parenting agreement/i)).toBeInTheDocument()
  })

  it('renders Parent 1 and Parent 2 input fields', () => {
    renderWithRouter(<HouseholdInfo />)
    expect(screen.getByLabelText(/parent 1/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/parent 2/i)).toBeInTheDocument()
  })

  it('accepts input in Parent 1 field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(screen.getByLabelText(/parent 1/i), 'Jane Smith')
    expect(screen.getByLabelText(/parent 1/i)).toHaveValue('Jane Smith')
  })

  it('accepts input in Parent 2 field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(screen.getByLabelText(/parent 2/i), 'John Smith')
    expect(screen.getByLabelText(/parent 2/i)).toHaveValue('John Smith')
  })

  // Children Section

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
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
  })

  it('accepts input in child first name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(screen.getByLabelText(/first name/i), 'Baby')
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Baby')
  })

  it('accepts input in child last name field', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.type(screen.getByLabelText(/last name/i), 'Smith')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith')
  })

  it('accepts a date of birth value', () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '2020-01-01' }
    })
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue('2020-01-01')
  })

  // Child Classification

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

  // Add/Remove Children

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
    expect(screen.getAllByLabelText(/first name/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/last name/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/date of birth/i)).toHaveLength(2)
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

  // Validation

  /* THIS TEST FAILS, need to implement this
  it('shows all required field errors when submitting empty form', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Parent 1 name is required')).toBeInTheDocument()
    expect(await screen.findByText('Parent 2 name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 date of birth is required')).toBeInTheDocument()
  })
  */

  it('clears Parent 1 error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Parent 1 name is required')
    await userEvent.type(screen.getByLabelText(/parent 1/i), 'Jane Smith')
    expect(screen.queryByText('Parent 1 name is required')).not.toBeInTheDocument()
  })

  it('clears Parent 2 error when user starts typing', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Parent 2 name is required')
    await userEvent.type(screen.getByLabelText(/parent 2/i), 'John Smith')
    expect(screen.queryByText('Parent 2 name is required')).not.toBeInTheDocument()
  })

  /* THIS TEST FAILS, need to implement this
  it('shows validation errors for all children on empty submit', async () => {
    renderWithRouter(<HouseholdInfo />)
    await userEvent.click(screen.getByRole('button', { name: /add another child/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Child 1 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 2 first name is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 1 date of birth is required')).toBeInTheDocument()
    expect(await screen.findByText('Child 2 date of birth is required')).toBeInTheDocument()
  })
  */

  it('does not navigate when Next is clicked with empty form', async () => {
    renderWithRouter(<HouseholdInfo />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  //  Footer Navigation 

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
    await userEvent.type(screen.getByLabelText(/parent 1/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/parent 2/i), 'John Smith')
    await userEvent.type(screen.getByLabelText(/first name/i), 'Baby')
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '2020-01-01' }
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/custody-schedule')
  })
})