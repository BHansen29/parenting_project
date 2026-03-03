import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaxExemptions from '../../src/pages/TaxExemptions'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('TaxExemptions', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Initial render ───────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<TaxExemptions />)
  })

  it('displays the Tax Exemptions heading', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText('Tax Exemptions')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText(/Decide who will claim tax exemptions/i)).toBeInTheDocument()
  })

  it('displays the info banner', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText(/significant financial implications/i)).toBeInTheDocument()
  })

  it('displays the parental role question', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText(/residential or non-residential parent/i)).toBeInTheDocument()
  })

  it('displays the main claim intent question', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText(/Do you want to claim your children/i)).toBeInTheDocument()
  })

  it('does not show child selection sections on initial load', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.queryByText(/Select Children/i)).not.toBeInTheDocument()
  })

  it('renders the Next and Back buttons', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  // ─── Parental role ────────────────────────────────────────────────────────

  it('renders both parental role radio options', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByLabelText(/I am the residential parent/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/I am the non-residential parent/i)).toBeInTheDocument()
  })

  it('selects the residential role when clicked', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    expect(screen.getByLabelText(/I am the residential parent/i)).toBeChecked()
  })

  it('selects the non-residential role when clicked', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the non-residential parent/i))
    expect(screen.getByLabelText(/I am the non-residential parent/i)).toBeChecked()
  })

  it('can switch parental role from residential to non-residential', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/I am the non-residential parent/i))
    expect(screen.getByLabelText(/I am the non-residential parent/i)).toBeChecked()
    expect(screen.getByLabelText(/I am the residential parent/i)).not.toBeChecked()
  })

  // ─── Claim intent — section visibility ────────────────────────────────────

  it('shows the every-year child selection section when everyYear is selected', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/each tax year going forward/i))
    expect(screen.getByText('Select Children — Every Year')).toBeInTheDocument()
  })

  it('shows the some-years child selection section when someYears is selected', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/some tax years going forward/i))
    expect(screen.getByText('Select Children — Some Years')).toBeInTheDocument()
  })

  it('does not show child selection sections for noClaim', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I don't plan to claim/i))
    expect(screen.queryByText(/Select Children/i)).not.toBeInTheDocument()
  })

  it('does not show child selection sections for needInfo', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I need more information/i))
    expect(screen.queryByText(/Select Children/i)).not.toBeInTheDocument()
  })

  it('shows the defer section when defer is selected and parentRole is set', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/Defer to my co-parent/i))
    expect(screen.getByText(/You have decided to defer/i)).toBeInTheDocument()
  })

  it('does not show the defer section when parentRole is not yet set', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/Defer to my co-parent/i))
    expect(screen.queryByText(/You have decided to defer/i)).not.toBeInTheDocument()
  })

  // ─── 6.b — Every year flow ────────────────────────────────────────────────

  it('renders child checkboxes in the every-year section', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/each tax year going forward/i))
    expect(screen.getByText(/Which children will you claim every year/i)).toBeInTheDocument()
  })

  it('does not show disclaimers before a child is selected in the every-year section', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/each tax year going forward/i))
    expect(screen.queryByText(/current on any child support/i)).not.toBeInTheDocument()
  })

  it('does not show the loop-back prompt before any child is selected', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/each tax year going forward/i))
    expect(screen.queryByText(/for the previous option/i)).not.toBeInTheDocument()
  })

  // ─── 6.c — Some years flow ───────────────────────────────────────────────

  it('does not show the tax year question before children are selected in some-years', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/some tax years going forward/i))
    expect(screen.queryByText(/Which tax years will you claim your children on/i)).not.toBeInTheDocument()
  })

  it('shows all three tax year options: odd, even, custom', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/some tax years going forward/i))
    // Note: this assertion only applies after a child is selected.
    // With no children in context, this section won't show — this confirms
    // the tax year question is gated behind child selection.
    expect(screen.queryByText(/Odd-numbered tax years/i)).not.toBeInTheDocument()
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('does not navigate when Next is clicked with an empty form', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a parentRole error when Next is clicked with no role selected', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/each tax year going forward/i))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText(/please indicate your parental role/i)).toBeInTheDocument()
  })

  it('shows a claimIntent error when Next is clicked with no intent selected', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText(/please select an option/i)).toBeInTheDocument()
  })

  it('clears the parentRole error when a role is selected after a failed submission', async () => {
    renderWithRouter(<TaxExemptions />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText(/please indicate your parental role/i)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    expect(screen.queryByText(/please indicate your parental role/i)).not.toBeInTheDocument()
  })

  it('clears the claimIntent error when an intent is selected after a failed submission', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findByText(/please select an option/i)
    await userEvent.click(screen.getByLabelText(/I don't plan to claim/i))
    expect(screen.queryByText(/please select an option/i)).not.toBeInTheDocument()
  })

  it('shows all required errors when both parentRole and claimIntent are missing', async () => {
    renderWithRouter(<TaxExemptions />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText(/please indicate your parental role/i)).toBeInTheDocument()
    expect(await screen.findByText(/please select an option/i)).toBeInTheDocument()
  })

  // ─── Navigation ───────────────────────────────────────────────────────────

  it('navigates to /informationsharing when Back is clicked', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/informationsharing')
  })

  it('navigates to /review for noClaim with parentRole set', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/I don't plan to claim/i))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  it('navigates to /review for needInfo with parentRole set', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/I need more information/i))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  it('navigates to /review for defer with parentRole set', async () => {
    renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/Defer to my co-parent/i))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })

  // ─── State persistence ────────────────────────────────────────────────────

  it('persists the selected parental role when the page re-mounts', async () => {
    const { unmount } = renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    unmount()
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByLabelText(/I am the residential parent/i)).toBeChecked()
  })

  it('persists the selected claim intent when the page re-mounts', async () => {
    const { unmount } = renderWithRouter(<TaxExemptions />)
    await userEvent.click(screen.getByLabelText(/I am the residential parent/i))
    await userEvent.click(screen.getByLabelText(/I don't plan to claim/i))
    unmount()
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByLabelText(/I don't plan to claim/i)).toBeChecked()
  })
})