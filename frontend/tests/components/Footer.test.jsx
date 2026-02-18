import { screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Footer from '../../src/components/common/Footer'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

describe('Footer', () => {

  // Render
  it('renders without crashing', () => {
    renderWithRouter(<Footer />)
  })

  // Default behavior
  it('shows Next button by default', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('does not show Back button by default', () => {
    renderWithRouter(<Footer />)
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
  })

  // showBackButton prop
  it('shows Back button when showBackButton is true', () => {
    renderWithRouter(<Footer showBackButton={true} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  // showNextButton prop
  it('hides Next button when showNextButton is false', () => {
    renderWithRouter(<Footer showNextButton={false} />)
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  // nextButtonText prop
  it('displays custom next button text', () => {
    renderWithRouter(<Footer nextButtonText="Submit" />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  // nextButtonDisabled prop
  it('disables Next button when nextButtonDisabled is true', () => {
    renderWithRouter(<Footer nextButtonDisabled={true} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('Next button is enabled by default', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  // onClick handlers
  it('calls onNext when Next button is clicked', () => {
    const onNext = vi.fn()
    renderWithRouter(<Footer onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when Back button is clicked', () => {
    const onBack = vi.fn()
    renderWithRouter(<Footer showBackButton={true} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('does not call onNext when button is disabled', () => {
    const onNext = vi.fn()
    renderWithRouter(<Footer onNext={onNext} nextButtonDisabled={true} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).not.toHaveBeenCalled()
  })
})