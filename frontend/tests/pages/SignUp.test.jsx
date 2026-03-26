import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SignUp from '../../src/pages/auth/SignUp'
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

describe('SignUp', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  // Render
  it('renders without crashing', () => {
    renderWithRouter(<SignUp />)
  })

  it('displays Welcome! heading', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByText('Welcome!')).toBeInTheDocument()
  })

  it('displays the ShareCare logo', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByAltText('ShareCare')).toBeInTheDocument()
  })

  // Form fields present
  it('renders all form fields and submit button', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument()
  })

  // Validation - empty fields
  it('shows errors when submitting empty form', async () => {
    renderWithRouter(<SignUp />)
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  // Validation - invalid format
  it('shows error when email format is invalid', async () => {
    renderWithRouter(<SignUp />)
    await userEvent.type(screen.getByLabelText(/email/i), 'notanemail')
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    expect(await screen.findByText('Email is invalid')).toBeInTheDocument()
  })

  it('shows error when password is under 6 characters', async () => {
    renderWithRouter(<SignUp />)
    await userEvent.type(screen.getByLabelText(/password/i), 'abc')
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  // Validation - errors clear on correction
  it('clears errors when user corrects input', async () => {
    renderWithRouter(<SignUp />)
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    await screen.findByText('Email is required')
    await screen.findByText('Password is required')
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
  })

  // Loading state
  it('shows loading state and disables button during submission', async () => {
    renderWithRouter(<SignUp />)
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    const loadingButton = await screen.findByRole('button', { name: /creating account/i })
    expect(loadingButton).toBeInTheDocument()
    expect(loadingButton).toBeDisabled()
  })

  // Navigation behavior
  it('navigates to /getting-started after successful sign up', async () => {
    renderWithRouter(<SignUp />)
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    await screen.findByText('Creating account...')
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/getting-started')
    }, { timeout: 2000 })
  })

  // Navigation links
  it('has correct navigation links', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('has a sign up link pointing to /signin', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/signin')
  })

  it('has a back to home link pointing to /', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})