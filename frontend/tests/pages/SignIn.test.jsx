import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SignIn from '../../src/pages/auth/SignIn'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

// Mock Firebase
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: '123' } })),
  getAuth: vi.fn(),
}))

vi.mock('../../src/lib/firebase', () => ({
  auth: {},
}))

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SignIn', () => {

    beforeEach(() => {
        mockNavigate.mockReset()
      })

  // Render
  it('renders without crashing', () => {
    renderWithRouter(<SignIn />)
  })

  it('displays Welcome Back heading', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('displays the ShareCare logo', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByAltText('ShareCare')).toBeInTheDocument()
  })

  // Form fields present
  it('renders the email field', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders the password field', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the Sign In submit button', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  // Validation - empty fields
  it('shows error when email is empty on submit', async () => {
    renderWithRouter(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
  })

  it('shows error when password is empty on submit', async () => {
    renderWithRouter(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  // Validation - invalid format
  it('shows error when email format is invalid', async () => {
    renderWithRouter(<SignIn />)
    await userEvent.type(screen.getByLabelText(/email/i), 'notanemail')
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText('Email is invalid')).toBeInTheDocument()
  })

  it('shows error when password is under 6 characters', async () => {
    renderWithRouter(<SignIn />)
    await userEvent.type(screen.getByLabelText(/password/i), 'abc')
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  // Validation - error clears on correction
  it('clears email error when user starts correcting input', async () => {
    renderWithRouter(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    await screen.findByText('Email is required')
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('clears password error when user starts correcting input', async () => {
    renderWithRouter(<SignIn />)
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    await screen.findByText('Password is required')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
  })

  // Loading state
  it('shows Signing in... during submission', async () => {
    renderWithRouter(<SignIn />)
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText('Signing in...')).toBeInTheDocument()
  })

  it('disables the button during loading', async () => {
    renderWithRouter(<SignIn />)
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  // Navigation behavior
  it('navigates to /getting-started after successful sign in', async () => {
    renderWithRouter(<SignIn />)
    await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    await screen.findByText('Signing in...')
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 2000 })
  })

  // Navigation links
  it('has correct navigation links', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('has a sign up link pointing to /signup', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup')
  })

  it('has a back to home link pointing to /', () => {
    renderWithRouter(<SignIn />)
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})