import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '../../src/pages/LandingPage'
import HowItWorks from '../../src/pages/HowItWorks'
import { vi } from 'vitest'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    window.sessionStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<LandingPage />)
  })

  // ─── Safety Banner ────────────────────────────────────────────────────────

  it('displays the safety resources banner', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/Safety Resources/i)).toBeInTheDocument()
    expect(screen.getByText(/1-800-799-7233/i)).toBeInTheDocument()
    expect(screen.getByText(/National Domestic Violence Hotline/i)).toBeInTheDocument()
  })

  // ─── Legal Disclaimer ─────────────────────────────────────────────────────

  it('displays the Important Notice section', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText('Important Notice')).toBeInTheDocument()
    expect(screen.getByText(/not legal advice/i)).toBeInTheDocument()
    expect(screen.getByText(/reviewed and approved by the court/i)).toBeInTheDocument()
    expect(
      screen.getByText(/If you have questions about your specific situation, please consult with an attorney./i)
    ).toBeInTheDocument()
  })

  // ─── Page Content ─────────────────────────────────────────────────────────

  it('displays main headings and logo', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/Create Your/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Parenting Plan/i })).toBeInTheDocument()
    expect(screen.getByAltText('ShareCare')).toBeInTheDocument()
  })

  // ─── Feature Cards ────────────────────────────────────────────────────────

  it('displays all feature cards', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText('Guided Process')).toBeInTheDocument()
    expect(screen.getByText('Child-Focused')).toBeInTheDocument()
    expect(screen.getByText('Work Together')).toBeInTheDocument()
  })

  // ─── Value Props ──────────────────────────────────────────────────────────

  it('displays value props', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText('Court Ready Format')).toBeInTheDocument()
    expect(screen.getByText('Free & Accessible')).toBeInTheDocument()
  })

  // ─── Navigation Buttons ───────────────────────────────────────────────────

  it('has all navigation buttons', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: /begin your plan/i })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: /^sign in$/i })).toHaveAttribute('href', '/signin')
  })

  it('switches between English and Spanish on the landing and How It Works pages', async () => {
    const user = userEvent.setup()
    const landing = renderWithRouter(<LandingPage />)

    await user.click(screen.getByRole('button', { name: 'Switch language to Spanish' }))
    expect(screen.getByRole('heading', { name: 'Crea tu Plan de crianza' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cómo funciona' })).toBeInTheDocument()

    landing.unmount()
    renderWithRouter(<HowItWorks />)
    expect(
      screen.getByRole('heading', {
        name: 'Hacemos más sencilla la creación de planes de crianza para todas las familias'
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comienza gratis' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cambiar idioma a inglés' }))
    expect(
      screen.getByRole('heading', { name: 'Simplifying parenting plan creation for all families' })
    ).toBeInTheDocument()
  })

  it('navigates to /signup when Get Started is clicked', async () => {
    renderWithRouter(<LandingPage />)
    await userEvent.click(screen.getByRole('link', { name: /get started/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
})

  it('navigates to /signup when Begin Your Plan is clicked', async () => {
    renderWithRouter(<LandingPage />)
    await userEvent.click(screen.getByRole('link', { name: /begin your plan/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates to /signin when Sign In is clicked', async () => {
    renderWithRouter(<LandingPage />)
    await userEvent.click(screen.getByRole('link', { name: /^sign in$/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ─── Footer ───────────────────────────────────────────────────────────────

  it('displays footer information', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/Action for Children/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy-policy')
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/terms-of-service')
    expect(screen.getByRole('link', { name: /contact support/i })).toHaveAttribute('href', '/contact-support')
  })
})