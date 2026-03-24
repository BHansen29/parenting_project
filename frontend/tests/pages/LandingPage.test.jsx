import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '../../src/pages/LandingPage'
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
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /begin your plan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('navigates to /signup when Get Started is clicked', async () => {
    renderWithRouter(<LandingPage />)
    await userEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/getting-started')
  })

  it('navigates to /signup when Begin Your Plan is clicked', async () => {
    renderWithRouter(<LandingPage />)
    await userEvent.click(screen.getByRole('button', { name: /begin your plan/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/signup')
  })

  it('navigates to /signin when Sign In is clicked', async () => {
    renderWithRouter(<LandingPage />)
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/signin')
  })

  // ─── Footer ───────────────────────────────────────────────────────────────

  it('displays footer information', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/Action for Children/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /terms of service/i })).toBeInTheDocument()
  })
})