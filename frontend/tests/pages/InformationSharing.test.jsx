import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import InformationSharing from '../../src/pages/InformationSharing'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('InformationSharing', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('renders the page heading and description', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getByText('Additional Information')).toBeInTheDocument()
    expect(
      screen.getByText(/Review child support worksheet requirements and resources/i)
    ).toBeInTheDocument()
  })

  it('does not render the removed built-in questions', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.queryByRole('heading', { name: 'Medical Information Access' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'School Contact Rights & Access to Information' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'School Activity Participation' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Do you agree to these default rights/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('renders additional questions configured by an administrator', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        qKey: 'admin_information_question',
        qTitle: 'Additional Information',
        qText: 'What else should your co-parent know?',
        qIntro: '',
        type: 'text input',
        options: [],
        pageManaged: false,
      }],
    }))

    renderWithRouter(<InformationSharing />)

    expect(await screen.findByText('What else should your co-parent know?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(await screen.findByText('Answer this question to continue.')).toBeInTheDocument()
  })

  it.each([
    ['married', '20', 'Shared Parenting Plan'],
    ['married_seeking_custody', '20', 'Shared Parenting Plan'],
    ['married_seeking_parenting_time', '20', 'Shared Parenting Plan'],
    ['never_married_seeking_custody', '21', 'Parenting Plan'],
    ['never_married_seeking_parenting_time', '21', 'Parenting Plan'],
  ])('shows the %s child-support information before Additional Resources', (
    currentCircumstance,
    formNumber,
    planName,
  ) => {
    localStorage.setItem('sharedCareForm', JSON.stringify({
      plan: { currentCircumstance },
    }))
    renderWithRouter(<InformationSharing />)

    const childSupportHeading = screen.getByRole('heading', { name: 'Child Support Calculation' })
    const resourcesHeading = screen.getByRole('heading', { name: 'Additional Resources' })
    expect(childSupportHeading).toBeInTheDocument()
    expect(resourcesHeading).toBeInTheDocument()
    expect(childSupportHeading.closest('.info-section'))
      .not.toBe(resourcesHeading.closest('.info-section'))
    expect(screen.getByText(new RegExp(`final ${planName}`))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: `Ohio Supreme Court Form ${formNumber}` }))
      .toHaveAttribute('href', `https://www.supremecourt.ohio.gov/docs/JCS/CFC/DRForms/Form${formNumber}.pdf`)
    expect(screen.queryByRole('link', {
      name: `Ohio Supreme Court Form ${formNumber === '20' ? '21' : '20'}`,
    })).not.toBeInTheDocument()

    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(headings.indexOf('Child Support Calculation'))
      .toBeLessThan(headings.indexOf('Additional Resources'))
    expect(screen.queryByRole('heading', { name: 'Medical Information Access' })).not.toBeInTheDocument()
  })

  it('does not show child-support information when circumstance is unavailable', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.queryByRole('heading', { name: 'Child Support Calculation' })).not.toBeInTheDocument()
  })

  it('renders the Next and Back buttons', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates back to parenting time and communication', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
  })

  it('navigates to tax exemptions without requiring the removed built-in answers', async () => {
    renderWithRouter(<InformationSharing />)
    await waitFor(() => {
      expect(screen.queryByText('Loading additional questions...')).not.toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tax-exemptions')
    })
  })

})
