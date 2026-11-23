import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import NextStepsModal from '../../../src/components/common/NextStepsModal'

describe('NextStepsModal', () => {
  it('shows the next-step notice and official form link', () => {
    render(
      <NextStepsModal isOpen onClose={vi.fn()} onContinue={vi.fn()} />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Next Steps for Completing Your Parenting Plan')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'here' }).find((link) =>
      link.getAttribute('href')?.includes('supremecourt.ohio.gov'),
    )).toHaveAttribute(
      'href',
      'https://www.supremecourt.ohio.gov/courts/services-to-courts/children-families/dom-rel-juvenile-forms/parenting-time/',
    )
  })

  it('continues to print and cancels without continuing', () => {
    const onContinue = vi.fn()
    const onClose = vi.fn()
    render(
      <NextStepsModal isOpen onClose={onClose} onContinue={onContinue} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /continue to print/i }))
    expect(onContinue).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
