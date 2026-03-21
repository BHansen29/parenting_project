import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Footer from '../../src/components/common/Footer'

describe('Footer', () => {

  // ─── Rendering ────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    render(<Footer />)
  })

  it('does not show the Back button by default', () => {
    render(<Footer />)
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
  })

  it('shows the Next button by default', () => {
    render(<Footer />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('shows the Back button when showBackButton is true', () => {
    render(<Footer showBackButton={true} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('hides the Next button when showNextButton is false', () => {
    render(<Footer showNextButton={false} />)
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('shows both buttons when showBackButton and showNextButton are true', () => {
    render(<Footer showBackButton={true} showNextButton={true} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('shows neither button when both are false', () => {
    render(<Footer showBackButton={false} showNextButton={false} />)
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  // ─── Button Text ──────────────────────────────────────────────────────────

  it('displays "Next" as the default next button text', () => {
    render(<Footer />)
    expect(screen.getByRole('button', { name: /next/i })).toHaveTextContent('Next →')
  })

  it('displays custom text on the next button when nextButtonText is provided', () => {
    render(<Footer nextButtonText="Submit" />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  // ─── Disabled State ───────────────────────────────────────────────────────

  it('next button is not disabled by default', () => {
    render(<Footer />)
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('next button is disabled when nextButtonDisabled is true', () => {
    render(<Footer nextButtonDisabled={true} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  // ─── Click Handlers ───────────────────────────────────────────────────────

  it('calls onNext when the Next button is clicked', async () => {
    const onNext = vi.fn()
    render(<Footer onNext={onNext} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when the Back button is clicked', async () => {
    const onBack = vi.fn()
    render(<Footer showBackButton={true} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('does not call onNext when the Next button is disabled', async () => {
    const onNext = vi.fn()
    render(<Footer onNext={onNext} nextButtonDisabled={true} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).not.toHaveBeenCalled()
  })

  it('does not throw when onNext is not provided and Next is clicked', async () => {
    render(<Footer />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
  })

  it('does not throw when onBack is not provided and Back is clicked', async () => {
    render(<Footer showBackButton={true} />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
  })

})