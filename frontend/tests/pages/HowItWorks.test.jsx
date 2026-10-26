import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import HowItWorks from '../../src/pages/HowItWorks'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('HowItWorks', () => {
  beforeEach(() => mockNavigate.mockReset())

  it('renders the process and family-focused content', () => {
    renderWithRouter(<HowItWorks />)

    expect(screen.getByRole('heading', { name: /simplifying parenting plan creation/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /choose the path that works for your family/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /start your plan/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /invite your co-parent/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /compare and agree/i })).toBeInTheDocument()
    expect(screen.getByText(/private responses until both parents are ready to compare/i)).toBeInTheDocument()
  })

  it('navigates from the primary calls to action', async () => {
    renderWithRouter(<HowItWorks />)

    await userEvent.click(screen.getByRole('button', { name: /create your plan/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/signup')
    await userEvent.click(screen.getByRole('button', { name: /return to sharecare home/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/signin')
  })

  it('provides footer links to the static pages', () => {
    renderWithRouter(<HowItWorks />)

    expect(screen.getByRole('button', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contact support/i })).toBeInTheDocument()
  })
})
