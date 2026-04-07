import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SignUp from '../../src/pages/auth/SignUp'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: '123' } })),
  getAuth: vi.fn(),
}))

vi.mock('../../src/lib/firebase', () => ({
  auth: {},
}))

vi.mock('../../src/lib/authApi', () => ({
  syncFirebaseUserProfileSafely: vi.fn(() => Promise.resolve()),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Stub LegalNoticeModal so SignUp tests are not coupled to modal internals.
// onAccept / onClose are wired directly to buttons — checkbox logic is tested
// in LegalNoticeModal.test.jsx.
vi.mock('../../src/components/common/LegalNoticeModal', () => ({
  default: ({ isOpen, onAccept, onClose }) => {
    if (!isOpen) return null
    return (
      <div role="dialog" aria-label="Important Notices">
        <h2>Important Notices</h2>
        <button onClick={onClose} aria-label="Close">X</button>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onAccept}>I Agree — Create Account</button>
      </div>
    )
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

// Fill valid credentials and click Sign Up to open the modal
const openModal = async () => {
  await userEvent.type(screen.getByLabelText(/email/i), 'valid@email.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'password123')
  fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
  await screen.findByText('Important Notices')
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SignUp', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  // ── Render ──────────────────────────────────────────────────────────────────

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

  it('renders all form fields and submit button', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument()
  })

  // ── Validation ──────────────────────────────────────────────────────────────

  it('shows errors when submitting empty form', async () => {
    renderWithRouter(<SignUp />)
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

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

  // ── Modal — appearance ──────────────────────────────────────────────────────

  it('does not show the legal notice modal on initial render', () => {
    renderWithRouter(<SignUp />)
    expect(screen.queryByText('Important Notices')).not.toBeInTheDocument()
  })

  it('does not open the modal when form is invalid', async () => {
    renderWithRouter(<SignUp />)
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    await screen.findByText('Email is required')
    expect(screen.queryByText('Important Notices')).not.toBeInTheDocument()
  })

  it('opens the legal notice modal when valid credentials are submitted', async () => {
    renderWithRouter(<SignUp />)
    await openModal()
    expect(screen.getByRole('dialog', { name: /important notices/i })).toBeInTheDocument()
  })

  // ── Modal — closing without creating account ────────────────────────────────

  it('closes the modal when the X button is clicked', async () => {
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByText('Important Notices')).not.toBeInTheDocument()
  })

  it('closes the modal when Cancel is clicked', async () => {
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText('Important Notices')).not.toBeInTheDocument()
  })

  it('does not navigate when modal is dismissed via X', async () => {
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when modal is dismissed via Cancel', async () => {
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not create a Firebase account when modal is dismissed', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    vi.mocked(createUserWithEmailAndPassword).mockClear()
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  // ── Account creation and navigation ────────────────────────────────────────

  it('creates a Firebase account only after accepting terms', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    vi.mocked(createUserWithEmailAndPassword).mockClear()
    renderWithRouter(<SignUp />)
    await openModal()

    // Must not be called just from opening the modal
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))

    await vi.waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'valid@email.com',
        'password123'
      )
    })
  })

  it('shows loading state while Firebase account is being created', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth')

    // Hold Firebase open so the component stays in loading state long enough to assert
    let resolveFirebase
    vi.mocked(createUserWithEmailAndPassword).mockImplementationOnce(
      () => new Promise((resolve) => { resolveFirebase = resolve })
    )

    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))

    const loadingBtn = await screen.findByRole('button', { name: /creating account/i })
    expect(loadingBtn).toBeDisabled()

    // Clean up — resolve so the component doesn't hang
    resolveFirebase({ user: { uid: '123' } })
  })

  it('navigates to /getting-started after accepting terms', async () => {
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/getting-started')
    }, { timeout: 2000 })
  })

  it('shows a general error if Firebase account creation fails', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
      new Error('Email already in use')
    )
    renderWithRouter(<SignUp />)
    await openModal()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    expect(await screen.findByText('Email already in use')).toBeInTheDocument()
  })

  // ── Navigation links ────────────────────────────────────────────────────────

  it('has a forgot password link', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('has a sign in link pointing to /signin', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/signin')
  })

  it('has a back to home link pointing to /', () => {
    renderWithRouter(<SignUp />)
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})