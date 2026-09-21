import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaxExemptions from '../../src/pages/TaxExemptions'
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

// Helper: seed localStorage with children then render TaxExemptions
const renderWithChildren = (children = [{ id: 1, firstName: 'Alice', lastName: 'Smith' }]) => {
  localStorage.setItem('sharedCareForm', JSON.stringify({
    plan: { children },
    taxExemptions: { errors: {} },
  }))
  return renderWithRouter(<TaxExemptions />)
}

const CHILD_NAME = 'Alice Smith'
const CHILD_INDEX = 0

describe('TaxExemptions', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<TaxExemptions />)
  })

  it('displays the Tax Exemptions heading', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByRole('heading', { name: 'Tax Exemptions' })).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<TaxExemptions />)
    expect(
      screen.getByText(/Decide who will claim tax exemptions for your children/i)
    ).toBeInTheDocument()
  })

  // ─── Section Rendering ────────────────────────────────────────────────────

  it('displays the parental role question', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText('What is your parental role?')).toBeInTheDocument()
  })

  it('displays the claiming children question', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText('Which children will you claim as tax exemptions?')).toBeInTheDocument()
  })

  it('displays the claiming children question when children exist', () => {
    renderWithChildren()
    expect(screen.getByText('Which children will you claim as tax exemptions?')).toBeInTheDocument()
  })

  // ─── Parental Role ────────────────────────────────────────────────────────

  it('renders residential and non-residential radio inputs', () => {
    renderWithRouter(<TaxExemptions />)
    expect(document.querySelector('input[name="parentRole"][value="residential"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="parentRole"][value="nonresidential"]')).toBeInTheDocument()
  })

  it('displays correct labels for parental role options', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText('I am the residential parent')).toBeInTheDocument()
    expect(screen.getByText('I am the non-residential parent')).toBeInTheDocument()
  })

  it('no parentRole radio is checked by default', () => {
    renderWithRouter(<TaxExemptions />)
    expect(document.querySelector('input[name="parentRole"][value="residential"]')).not.toBeChecked()
    expect(document.querySelector('input[name="parentRole"][value="nonresidential"]')).not.toBeChecked()
  })

  it('can select the residential parent role', async () => {
    renderWithRouter(<TaxExemptions />)
    const radio = document.querySelector('input[name="parentRole"][value="residential"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select the non-residential parent role', async () => {
    renderWithRouter(<TaxExemptions />)
    const radio = document.querySelector('input[name="parentRole"][value="nonresidential"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting non-residential deselects residential', async () => {
    renderWithRouter(<TaxExemptions />)
    const residential = document.querySelector('input[name="parentRole"][value="residential"]')
    const nonresidential = document.querySelector('input[name="parentRole"][value="nonresidential"]')
    await userEvent.click(residential)
    await userEvent.click(nonresidential)
    expect(nonresidential).toBeChecked()
    expect(residential).not.toBeChecked()
  })

  // ─── Children List ────────────────────────────────────────────────────────

  it('shows no child options when no children exist in state', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('shows a checkbox for each child when children exist', () => {
    renderWithChildren()
    expect(screen.getByText(CHILD_NAME)).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  })

  it('no child checkboxes are checked by default', () => {
    renderWithChildren()
    screen.getAllByRole('checkbox').forEach(cb => expect(cb).not.toBeChecked())
  })

  it('does not show a none-selected note on the static page', () => {
    renderWithChildren()
    expect(screen.queryByText(/If you do not plan to claim any children/i)).not.toBeInTheDocument()
  })

  it('renders multiple children when provided', () => {
    renderWithChildren([
      { id: 1, firstName: 'Alice', lastName: 'Smith' },
      { id: 2, firstName: 'Bob', lastName: 'Jones' },
    ])
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  // ─── Toggle Child (toggleChild) ───────────────────────────────────────────

  it('checking a child marks the checkbox as checked', async () => {
    renderWithChildren()
    const checkbox = screen.getAllByRole('checkbox')[0]
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('unchecking a child marks the checkbox as unchecked', async () => {
    renderWithChildren()
    const checkbox = screen.getAllByRole('checkbox')[0]
    await userEvent.click(checkbox)
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('checking a child reveals the Tax Claiming Details section', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(screen.getByText(`How will you claim ${CHILD_NAME} on tax forms?`)).toBeInTheDocument()
  })

  it('unchecking a child hides its ChildTaxBlock', async () => {
    renderWithChildren()
    const checkbox = screen.getAllByRole('checkbox')[0]
    await userEvent.click(checkbox)
    expect(screen.getByText(`How will you claim ${CHILD_NAME} on tax forms?`)).toBeInTheDocument()
    await userEvent.click(checkbox)
    expect(screen.queryByText(`How will you claim ${CHILD_NAME} on tax forms?`)).not.toBeInTheDocument()
  })

  it('hides the "none" note once at least one child is checked', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(
      screen.queryByText(/If you do not plan to claim any children, leave all boxes unchecked/i)
    ).not.toBeInTheDocument()
  })

  it('checking one child does not check another child', async () => {
    renderWithChildren([
      { id: 1, firstName: 'Alice', lastName: 'Smith' },
      { id: 2, firstName: 'Bob', lastName: 'Jones' },
    ])
    const [aliceCheckbox, bobCheckbox] = screen.getAllByRole('checkbox')
    await userEvent.click(aliceCheckbox)
    expect(aliceCheckbox).toBeChecked()
    expect(bobCheckbox).not.toBeChecked()
  })

  // ─── ChildTaxBlock ────────────────────────────────────────────────────────

  it('shows the claiming question for the selected child', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(
      screen.getByText(`How will you claim ${CHILD_NAME} on tax forms?`)
    ).toBeInTheDocument()
  })

  it('shows the child\'s first initial in the avatar', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders all 3 intent options for the selected child', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(screen.getByText('I will claim this child every year')).toBeInTheDocument()
    expect(
      screen.getByText('I will claim this child some years (alternating or specific years)')
    ).toBeInTheDocument()
    expect(screen.getByText('I defer to my co-parent to claim this child')).toBeInTheDocument()
  })

  it('can select "every year" intent for the child', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    const radio = document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`)
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "some years" intent for the child', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    const radio = document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`)
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "defer" intent for the child', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    const radio = document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="defer"]`)
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new intent deselects the previous one', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    const everyYear = document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`)
    const defer = document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="defer"]`)
    await userEvent.click(everyYear)
    await userEvent.click(defer)
    expect(defer).toBeChecked()
    expect(everyYear).not.toBeChecked()
  })

  it('shows the tax year sub-question when "some years" is selected', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    expect(
      screen.getByText(`Which tax years will you claim ${CHILD_NAME}?`)
    ).toBeInTheDocument()
  })

  it('shows all 3 tax year options when "some years" is selected', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    expect(screen.getByText(/Odd-numbered tax years/i)).toBeInTheDocument()
    expect(screen.getByText(/Even-numbered tax years/i)).toBeInTheDocument()
    expect(screen.getByText(/Custom — I will specify the years/i)).toBeInTheDocument()
  })

  it('does not show the tax year sub-question when "every year" is selected', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    expect(
      screen.queryByText(`Which tax years will you claim ${CHILD_NAME}?`)
    ).not.toBeInTheDocument()
  })

  it('shows the custom year text input when "Custom" tax year is selected', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="custom"]`))
    expect(screen.getByLabelText(/Enter the tax years you will claim/i)).toBeInTheDocument()
  })

  it('can type custom years into the text input', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="custom"]`))
    const input = document.querySelector('#customYears-0')
    await userEvent.type(input, '2025, 2027, 2029')
    expect(input).toHaveValue('2025, 2027, 2029')
  })

  it('does not show the custom year input when "odd" tax year is selected', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="odd"]`))
    expect(
      screen.queryByLabelText(/Enter the tax years you will claim/i)
    ).not.toBeInTheDocument()
  })

  // ─── Disclaimers ──────────────────────────────────────────────────────────

  it('shows the child-support warning disclaimer for "every year" intent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    expect(
      screen.getByText(/you must be current on any child support/i)
    ).toBeInTheDocument()
  })

  it('shows the residential everyYear disclaimer for residential parent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    expect(
      screen.getByText(/As the residential parent, you will receive the necessary tax forms/i)
    ).toBeInTheDocument()
  })

  it('shows the non-residential everyYear disclaimer for non-residential parent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="nonresidential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    expect(
      screen.getByText(/the residential parent is required to deliver IRS Form 8332/i)
    ).toBeInTheDocument()
  })

  it('shows the residential defer disclaimer for residential parent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="defer"]`))
    expect(
      screen.getByText(/As the residential parent, you are required to deliver IRS Form 8332/i)
    ).toBeInTheDocument()
  })

  it('shows the non-residential defer disclaimer for non-residential parent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="nonresidential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="defer"]`))
    expect(
      screen.getByText(/As the non-residential parent, your co-parent is required to deliver IRS Form 8332/i)
    ).toBeInTheDocument()
  })

  it('shows the odd-year disclaimer for residential parent claiming odd years', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="odd"]`))
    expect(
      screen.getByText(/to the non-residential parent for even-numbered tax years/i)
    ).toBeInTheDocument()
  })

  it('shows the even-year disclaimer for residential parent claiming even years', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="even"]`))
    expect(
      screen.getByText(/to the non-residential parent for odd-numbered tax years/i)
    ).toBeInTheDocument()
  })

  it('shows the custom years disclaimer when custom tax year is selected', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="custom"]`))
    expect(
      screen.getByText(/The residential parent is required to deliver IRS Form 8332/i)
    ).toBeInTheDocument()
  })

  it('does not show everyYear disclaimers before parentRole is selected', async () => {
    renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    expect(
      screen.queryByText(/As the residential parent, you will receive the necessary tax forms/i)
    ).not.toBeInTheDocument()
  })

  // ─── Validation ───────────────────────────────────────────────────────────
  //TODO: use these tests once implemented

  /*
  it('does not show errors before the form is submitted', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.queryByText('Please indicate your parental role.')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Please select at least one child/i)
    ).not.toBeInTheDocument()
  })

  it('shows parentRole error when Next is clicked with no parentRole selected', async () => {
    renderWithChildren()
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText('Please indicate your parental role.')
    ).toBeInTheDocument()
  })

  it('shows claimingChildren error when Next is clicked with no children checked', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText('Please select at least one child, or indicate you are not claiming any.')
    ).toBeInTheDocument()
  })

  it('shows intent error for a selected child with no intent chosen', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText('Please select an option for this child.')
    ).toBeInTheDocument()
  })

  it('shows taxYears error when "some years" is selected but no tax year is chosen', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText('Please select which tax years.')
    ).toBeInTheDocument()
  })

  it('shows customYears error when "custom" is selected but no years are entered', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="custom"]`))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText('Please enter the specific tax years.')
    ).toBeInTheDocument()
  })

  it('shows a format error when custom years are not valid 4-digit years', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="custom"]`))
    await userEvent.type(document.querySelector('#customYears-0'), 'bad input')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText(/Please enter years as comma-separated 4-digit years/i)
    ).toBeInTheDocument()
  })

  it('clears the parentRole error after a role is selected', async () => {
    renderWithChildren()
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText('Please indicate your parental role.')
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    expect(screen.queryByText('Please indicate your parental role.')).not.toBeInTheDocument()
  })

  it('does not navigate when Next is clicked with no selections', async () => {
    renderWithChildren()
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when only parentRole is filled but no child is selected', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when child is selected but intent is not chosen', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
    */

  // ─── Footer Navigation ────────────────────────────────────────────────────

  it('renders the Next and Back buttons in the footer', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to /informationsharing when Back is clicked', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/informationsharing')
  })

  it('navigates to /review on valid form submission with "every year" intent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  it('navigates to /review when "some years" is selected with odd-year option', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="odd"]`))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  it('navigates to /review when "defer" intent is selected', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="defer"]`))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  it('navigates to /review when "custom" years are entered with a valid year list', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="someYears"]`))
    await userEvent.click(document.querySelector(`input[name="taxYears-${CHILD_INDEX}"][value="custom"]`))
    await userEvent.type(document.querySelector('#customYears-0'), '2025, 2027')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  // ─── Global State Management ──────────────────────────────────────────────

  it('persists parentRole selection when returning to the page', async () => {
    const { unmount } = renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    unmount()
    renderWithRouter(<TaxExemptions />)
    expect(document.querySelector('input[name="parentRole"][value="residential"]')).toBeChecked()
  })

  it('persists child checkbox selection when returning to the page', async () => {
    const { unmount } = renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    unmount()
    renderWithRouter(<TaxExemptions />)
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
  })

  it('persists child intent selection when returning to the page', async () => {
    const { unmount } = renderWithChildren()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`))
    unmount()
    renderWithRouter(<TaxExemptions />)
    expect(
      document.querySelector(`input[name="intent-${CHILD_INDEX}"][value="everyYear"]`)
    ).toBeChecked()
  })
})
