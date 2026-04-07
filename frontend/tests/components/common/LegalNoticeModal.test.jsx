import { screen, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import LegalNoticeModal from '../../../src/components/common/LegalNoticeModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

const onAccept = vi.fn()
const onClose = vi.fn()

const renderModal = (isOpen = true) =>
  render(<LegalNoticeModal isOpen={isOpen} onAccept={onAccept} onClose={onClose} />)

// Check all three acknowledgment checkboxes
const checkAllBoxes = async () => {
  await userEvent.click(screen.getByLabelText(/this form is not legal advice/i))
  await userEvent.click(screen.getByLabelText(/not be provided a lawyer/i))
  await userEvent.click(screen.getByLabelText(/laws may have changed/i))
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LegalNoticeModal', () => {
  beforeEach(() => {
    onAccept.mockReset()
    onClose.mockReset()
  })

  // ── Visibility ──────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    renderModal(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the modal when isOpen is true', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  // ── Content ─────────────────────────────────────────────────────────────────

  it('displays the Important Notices heading', () => {
    renderModal()
    expect(screen.getByText('Important Notices')).toBeInTheDocument()
  })

  it('displays all three notice sections', () => {
    renderModal()
    expect(screen.getByText('Not Legal Advice')).toBeInTheDocument()
    expect(screen.getByText('No Individual Legal Help')).toBeInTheDocument()
    expect(screen.getByText('Laws May Have Changed')).toBeInTheDocument()
  })

  it('displays all three acknowledgment checkboxes unchecked by default', () => {
    renderModal()
    expect(screen.getByLabelText(/this form is not legal advice/i)).not.toBeChecked()
    expect(screen.getByLabelText(/not be provided a lawyer/i)).not.toBeChecked()
    expect(screen.getByLabelText(/laws may have changed/i)).not.toBeChecked()
  })

  it('displays the confirm button', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /i agree/i })).toBeInTheDocument()
  })

  it('displays the cancel button', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('displays the close (X) button', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  // ── Checkbox interaction ────────────────────────────────────────────────────

  it('checks a checkbox when clicked', async () => {
    renderModal()
    const checkbox = screen.getByLabelText(/this form is not legal advice/i)
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('unchecks a checkbox when clicked again', async () => {
    renderModal()
    const checkbox = screen.getByLabelText(/this form is not legal advice/i)
    await userEvent.click(checkbox)
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  // ── Confirm button — blocked until all checked ──────────────────────────────

  it('does not call onAccept when confirming with no boxes checked', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('does not call onAccept when only some boxes are checked', async () => {
    renderModal()
    await userEvent.click(screen.getByLabelText(/this form is not legal advice/i))
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('shows an error message when confirming without all boxes checked', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    expect(await screen.findByText(/please check all boxes/i)).toBeInTheDocument()
  })

  it('does not show an error message before the confirm button is clicked', () => {
    renderModal()
    expect(screen.queryByText(/please check all boxes/i)).not.toBeInTheDocument()
  })

  it('hides the error message once all boxes are checked', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    await screen.findByText(/please check all boxes/i)
    await checkAllBoxes()
    expect(screen.queryByText(/please check all boxes/i)).not.toBeInTheDocument()
  })

  it('calls onAccept when all boxes are checked and confirm is clicked', async () => {
    renderModal()
    await checkAllBoxes()
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  // ── Closing ─────────────────────────────────────────────────────────────────

  it('calls onClose when the X button is clicked', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the Cancel button is clicked', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onAccept when the modal is closed via X', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('does not call onAccept when the modal is closed via Cancel', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onAccept).not.toHaveBeenCalled()
  })

  // ── State reset on close ────────────────────────────────────────────────────

  it('resets checkboxes to unchecked after closing and reopening', async () => {
    const { rerender } = renderModal()

    // Check all boxes then close
    await checkAllBoxes()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    // Reopen
    rerender(<LegalNoticeModal isOpen={true} onAccept={onAccept} onClose={onClose} />)

    expect(screen.getByLabelText(/this form is not legal advice/i)).not.toBeChecked()
    expect(screen.getByLabelText(/not be provided a lawyer/i)).not.toBeChecked()
    expect(screen.getByLabelText(/laws may have changed/i)).not.toBeChecked()
  })

  it('resets the error message after closing and reopening', async () => {
    const { rerender } = renderModal()

    // Trigger error then close
    fireEvent.click(screen.getByRole('button', { name: /i agree/i }))
    await screen.findByText(/please check all boxes/i)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    // Reopen
    rerender(<LegalNoticeModal isOpen={true} onAccept={onAccept} onClose={onClose} />)

    expect(screen.queryByText(/please check all boxes/i)).not.toBeInTheDocument()
  })
})