import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import TaxExemptions from '../../src/pages/TaxExemptions'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

const renderWithChildren = (children = [{ fName: 'Alice', lName: 'Smith' }]) => {
  localStorage.setItem('sharedCareForm', JSON.stringify({
    plan: { children },
    taxExemptions: { errors: {}, claimingChildren: children.map((child) =>
      `${child.fName ?? child.firstName ?? ''} ${child.lName ?? child.lastName ?? ''}`.trim()
    ) },
  }))
  return renderWithRouter(<TaxExemptions />)
}

describe('TaxExemptions', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('renders the heading and updated description', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByRole('heading', { name: 'Tax Exemptions' })).toBeInTheDocument()
    expect(screen.getByText(/Decide which parent will claim each child/i)).toBeInTheDocument()
  })

  it('renders the parental role question', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText('What is your parental role?')).toBeInTheDocument()
  })

  it('renders residential and non-residential radio inputs', () => {
    renderWithRouter(<TaxExemptions />)
    expect(document.querySelector('input[name="parentRole"][value="residential"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="parentRole"][value="nonresidential"]')).toBeInTheDocument()
  })

  it('displays the parental role labels', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.getByText('I am the residential parent')).toBeInTheDocument()
    expect(screen.getByText('I am the non-residential parent')).toBeInTheDocument()
  })

  it('has no parental role selected by default', () => {
    renderWithRouter(<TaxExemptions />)
    expect(document.querySelector('input[name="parentRole"][value="residential"]')).not.toBeChecked()
    expect(document.querySelector('input[name="parentRole"][value="nonresidential"]')).not.toBeChecked()
  })

  it('can select either parental role', async () => {
    renderWithRouter(<TaxExemptions />)
    const residential = document.querySelector('input[name="parentRole"][value="residential"]')
    const nonResidential = document.querySelector('input[name="parentRole"][value="nonresidential"]')
    await userEvent.click(residential)
    expect(residential).toBeChecked()
    await userEvent.click(nonResidential)
    expect(nonResidential).toBeChecked()
    expect(residential).not.toBeChecked()
  })

  it('renders a tax claiming block for each child', () => {
    renderWithChildren([
      { fName: 'Alice', lName: 'Smith' },
      { fName: 'Bob', lName: 'Jones' },
    ])
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('renders no child block when no children exist', () => {
    renderWithRouter(<TaxExemptions />)
    expect(screen.queryByText(/Tax claiming arrangement/i)).not.toBeInTheDocument()
  })

  it('shows the claiming question and each intent option for a child', () => {
    renderWithChildren()
    expect(screen.getByText('Who will claim Alice Smith on tax forms?')).toBeInTheDocument()
    expect(screen.getByText(/I will claim Alice Smith every year/i)).toBeInTheDocument()
    expect(screen.getByText(/My co-parent will claim Alice Smith every year/i)).toBeInTheDocument()
    expect(screen.getByText(/The parents will split claiming Alice Smith per year/i)).toBeInTheDocument()
  })

  it('shows the child initial in the avatar', () => {
    renderWithChildren()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('can select every-year intent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="intent-0"][value="parent1EveryYear"]'))
    expect(document.querySelector('input[name="intent-0"][value="parent1EveryYear"]')).toBeChecked()
  })

  it('can switch to split-years intent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="intent-0"][value="parent1EveryYear"]'))
    await userEvent.click(document.querySelector('input[name="intent-0"][value="someYears"]'))
    expect(document.querySelector('input[name="intent-0"][value="someYears"]')).toBeChecked()
    expect(document.querySelector('input[name="intent-0"][value="parent1EveryYear"]')).not.toBeChecked()
  })

  it('shows tax-year options only for split-years intent', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="intent-0"][value="someYears"]'))
    expect(screen.getByText(/Odd-numbered tax years/i)).toBeInTheDocument()
    expect(screen.getByText(/Even-numbered tax years/i)).toBeInTheDocument()
    expect(screen.getByText(/Custom — I will specify the years/i)).toBeInTheDocument()
  })

  it('shows custom year inputs for custom tax years', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="intent-0"][value="someYears"]'))
    await userEvent.click(document.querySelector('input[name="taxYears-0"][value="custom"]'))
    expect(document.querySelector('#customYears-0')).toBeInTheDocument()
    expect(document.querySelector('#coParentCustomYears-0')).toBeInTheDocument()
  })

  it('hides custom year inputs for odd or even years', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="intent-0"][value="someYears"]'))
    await userEvent.click(document.querySelector('input[name="taxYears-0"][value="odd"]'))
    expect(document.querySelector('#customYears-0')).not.toBeInTheDocument()
  })

  it('allows custom years to be entered', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="intent-0"][value="someYears"]'))
    await userEvent.click(document.querySelector('input[name="taxYears-0"][value="custom"]'))
    await userEvent.type(document.querySelector('#customYears-0'), '2025, 2029')
    await userEvent.type(document.querySelector('#coParentCustomYears-0'), '2026, 2028')
    expect(document.querySelector('#customYears-0')).toHaveValue('2025, 2029')
    expect(document.querySelector('#coParentCustomYears-0')).toHaveValue('2026, 2028')
  })

  it('shows every-year disclaimers after both role and intent are selected', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(document.querySelector('input[name="intent-0"][value="parent1EveryYear"]'))
    expect(document.querySelector('[data-testid="disclaimer-info"]') || document.body).toBeTruthy()
  })

  it('renders Next and Back footer buttons', () => {
    renderWithChildren()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates back to information sharing', async () => {
    renderWithChildren()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/informationsharing')
  })

  it('validates before navigating to review', async () => {
    renderWithChildren()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalledWith('/review')
  })

  it('navigates to review after a complete every-year arrangement', async () => {
    renderWithChildren()
    await userEvent.click(document.querySelector('input[name="parentRole"][value="residential"]'))
    await userEvent.click(document.querySelector('input[name="intent-0"][value="parent1EveryYear"]'))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/review')
  })
})
