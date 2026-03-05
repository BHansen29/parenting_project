import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ParentingTimeAndCommunication from '../../src/pages/ParentingTimeAndCommunication'
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

// Mock scrollIntoView — not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Helper: fill in the minimum valid form to allow navigation
const fillValidForm = async () => {
  await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
  await userEvent.click(document.querySelector('#hide-checkbox-activity'))
  await userEvent.click(document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]'))
  await userEvent.click(document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]'))
}

describe('ParentingTimeAndCommunication', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
  })

  it('displays the page heading', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Parenting Time & Communication')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      screen.getByText(/Establish how parenting time will be structured/i)
    ).toBeInTheDocument()
  })

  // ─── Section Rendering ────────────────────────────────────────────────────

  it('displays the Transportation Agreement section', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Transportation Agreement')).toBeInTheDocument()
    expect(screen.getByText('Standard transportation arrangements')).toBeInTheDocument()
  })

  it('displays the Activities & Scheduling section', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Activities & Scheduling')).toBeInTheDocument()
    expect(screen.getByText("Supporting your children's activities")).toBeInTheDocument()
  })

  it('displays the Parenting Schedule section', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Parenting Schedule')).toBeInTheDocument()
    expect(screen.getByText(/Create your monthly parenting schedule/i)).toBeInTheDocument()
  })

  it('displays the Communication with Co-Parent section', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Communication with Co-Parent')).toBeInTheDocument()
    expect(screen.getByText('Phone and communication access')).toBeInTheDocument()
  })

  // ─── Transportation Agreement ─────────────────────────────────────────────

  it('displays the standard transportation policy text', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Standard Transportation Policy:')).toBeInTheDocument()
  })

  it('displays the transportation required note', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      screen.getByText(/You must either agree to the standard policy or describe your preferred arrangement/i)
    ).toBeInTheDocument()
  })

  it('renders the transportation agreement checkbox unchecked by default', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(document.querySelector('#hide-checkbox-transportation')).not.toBeChecked()
  })

  it('renders the transportation description text input', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(document.querySelector('#transportationArrangementDescription')).toBeInTheDocument()
  })

  it('can check the transportation agreement checkbox', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const checkbox = document.querySelector('#hide-checkbox-transportation')
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('can uncheck the transportation agreement checkbox', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const checkbox = document.querySelector('#hide-checkbox-transportation')
    await userEvent.click(checkbox)
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('can type into the transportation description field', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const input = document.querySelector('#transportationArrangementDescription')
    await userEvent.type(input, 'We will split driving equally')
    expect(input).toHaveValue('We will split driving equally')
  })

  // ─── Activities & Scheduling ──────────────────────────────────────────────

  it('displays the standard activity policy text', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByText('Standard Activity Policy:')).toBeInTheDocument()
  })

  it('renders the activity agreement checkbox unchecked by default', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(document.querySelector('#hide-checkbox-activity')).not.toBeChecked()
  })

  it('renders the activity description text input', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(document.querySelector('#activityArrangementDescription')).toBeInTheDocument()
  })

  it('can check the activity agreement checkbox', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const checkbox = document.querySelector('#hide-checkbox-activity')
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('can type into the activity description field', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const input = document.querySelector('#activityArrangementDescription')
    await userEvent.type(input, 'Both parents may attend all events')
    expect(input).toHaveValue('Both parents may attend all events')
  })

  // ─── Communication with Co-Parent on Phone ────────────────────────────────

  it('displays the phone communication question', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      screen.getByText(/If your child is with you, are they allowed to talk to your co-parent on the phone/i)
    ).toBeInTheDocument()
  })

  it('renders all five communicationWithCoParentOnPhone radio options', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    ;['yes', 'no', 'sometimes', 'needMoreInfo', 'defaultToCoParentChoice'].forEach(value => {
      expect(
        document.querySelector(`input[name="communicationWithCoParentOnPhone"][value="${value}"]`)
      ).toBeInTheDocument()
    })
  })

  it('no communicationWithCoParentOnPhone radio is checked by default', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    ;['yes', 'no', 'sometimes', 'needMoreInfo', 'defaultToCoParentChoice'].forEach(value => {
      expect(
        document.querySelector(`input[name="communicationWithCoParentOnPhone"][value="${value}"]`)
      ).not.toBeChecked()
    })
  })

  it('can select "Yes" for phone communication', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No" for phone communication', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="no"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Sometimes" for phone communication', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "I need more information" for phone communication', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="needMoreInfo"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Default to my co-parent\'s choice" for phone communication', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="defaultToCoParentChoice"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new phone communication option deselects the previous one', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const yes = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    const no = document.querySelector('input[name="communicationWithCoParentOnPhone"][value="no"]')
    await userEvent.click(yes)
    await userEvent.click(no)
    expect(no).toBeChecked()
    expect(yes).not.toBeChecked()
  })

  it('does not show the phone description field when "Sometimes" is not selected', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      document.querySelector('#communicationWithCoParentOnPhoneDescription')
    ).not.toBeInTheDocument()
  })

  it('shows the phone description field when "Sometimes" is selected', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    )
    expect(
      document.querySelector('#communicationWithCoParentOnPhoneDescription')
    ).toBeInTheDocument()
  })

  it('hides the phone description field when switching away from "Sometimes"', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    )
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    )
    expect(
      document.querySelector('#communicationWithCoParentOnPhoneDescription')
    ).not.toBeInTheDocument()
  })

  it('can type into the phone communication description field', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    )
    const input = document.querySelector('#communicationWithCoParentOnPhoneDescription')
    await userEvent.type(input, 'Only during scheduled call times')
    expect(input).toHaveValue('Only during scheduled call times')
  })

  // ─── Notify Co-Parent of Child-Related Events ─────────────────────────────

  it('displays the notify co-parent question', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      screen.getByText(/Should your co-parent be told if your children get sick or injured/i)
    ).toBeInTheDocument()
  })

  it('renders all five notifyCoParentOfChildRelatedEvents radio options', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    ;['yes', 'no', 'sometimes', 'needMoreInfo', 'defaultToCoParentChoice'].forEach(value => {
      expect(
        document.querySelector(`input[name="notifyCoParentOfChildRelatedEvents"][value="${value}"]`)
      ).toBeInTheDocument()
    })
  })

  it('no notifyCoParentOfChildRelatedEvents radio is checked by default', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    ;['yes', 'no', 'sometimes', 'needMoreInfo', 'defaultToCoParentChoice'].forEach(value => {
      expect(
        document.querySelector(`input[name="notifyCoParentOfChildRelatedEvents"][value="${value}"]`)
      ).not.toBeChecked()
    })
  })

  it('can select "Yes" for notify co-parent', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "No" for notify co-parent', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="no"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Sometimes" for notify co-parent', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const radio = document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="sometimes"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new notify option deselects the previous one', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    const yes = document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    const no = document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="no"]')
    await userEvent.click(yes)
    await userEvent.click(no)
    expect(no).toBeChecked()
    expect(yes).not.toBeChecked()
  })

  it('does not show the notify description field when "Sometimes" is not selected', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      document.querySelector('#notifyCoParentOfChildRelatedEventsDescription')
    ).not.toBeInTheDocument()
  })

  it('shows the notify description field when "Sometimes" is selected', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="sometimes"]')
    )
    expect(
      document.querySelector('#notifyCoParentOfChildRelatedEventsDescription')
    ).toBeInTheDocument()
  })

  it('hides the notify description field when switching away from "Sometimes"', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="sometimes"]')
    )
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    )
    expect(
      document.querySelector('#notifyCoParentOfChildRelatedEventsDescription')
    ).not.toBeInTheDocument()
  })

  it('can type into the notify description field', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="sometimes"]')
    )
    const input = document.querySelector('#notifyCoParentOfChildRelatedEventsDescription')
    await userEvent.type(input, 'Only for hospitalizations')
    expect(input).toHaveValue('Only for hospitalizations')
  })

  // ─── Cross-section independence ───────────────────────────────────────────

  it('selecting a phone communication option does not affect the notify section', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    )
    ;['yes', 'no', 'sometimes', 'needMoreInfo', 'defaultToCoParentChoice'].forEach(value => {
      expect(
        document.querySelector(`input[name="notifyCoParentOfChildRelatedEvents"][value="${value}"]`)
      ).not.toBeChecked()
    })
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('does not show errors before the form is submitted', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      screen.queryByText('Please agree to the standard policy or describe your preferred arrangement')
    ).not.toBeInTheDocument()
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(0)
  })

  it('shows transportation error when Next is clicked with no transportation input', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(
      await screen.findByText('Please agree to the standard policy or describe your preferred arrangement')
    ).toBeInTheDocument()
  })

  it('shows two errors on empty submit — one per text-based policy section', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const policyErrors = await screen.findAllByText(
      'Please agree to the standard policy or describe your preferred arrangement'
    )
    expect(policyErrors).toHaveLength(2)
  })

  it('shows communication radio error when Next is clicked with no selection', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const radioErrors = await screen.findAllByText('Please select an option to continue')
    expect(radioErrors).toHaveLength(2)
  })

  it('does not show transportation error when checkbox is checked', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const policyErrors = await screen.findAllByText(
      'Please agree to the standard policy or describe your preferred arrangement'
    )
    expect(policyErrors).toHaveLength(1)
  })

  it('does not show transportation error when description is provided', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.type(
      document.querySelector('#transportationArrangementDescription'),
      'We will alternate pick-up'
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const policyErrors = await screen.findAllByText(
      'Please agree to the standard policy or describe your preferred arrangement'
    )
    expect(policyErrors).toHaveLength(1)
  })

  it('does not show activity error when checkbox is checked', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-activity'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const policyErrors = await screen.findAllByText(
      'Please agree to the standard policy or describe your preferred arrangement'
    )
    expect(policyErrors).toHaveLength(1)
  })

  it('clears the communication radio error after selecting an option', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    )
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(1)
  })

  it('clears the notify radio error after selecting an option', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option to continue')
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    )
    expect(screen.queryAllByText('Please select an option to continue')).toHaveLength(1)
  })

  it('shows "Sometimes" description error when description is empty', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    await userEvent.click(document.querySelector('#hide-checkbox-activity'))
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    )
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Please describe the circumstances')).toBeInTheDocument()
  })

  it('shows notify "Sometimes" description error when description is empty', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    await userEvent.click(document.querySelector('#hide-checkbox-activity'))
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    )
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="sometimes"]')
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Please describe the circumstances')).toBeInTheDocument()
  })

  it('does not navigate when Next is clicked with an empty form', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when only transportation is filled', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when "Sometimes" is selected but description is empty', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    await userEvent.click(document.querySelector('#hide-checkbox-activity'))
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    )
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ─── Footer Navigation ────────────────────────────────────────────────────

  it('renders the Next and Back buttons', () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to /parental-rights when Back is clicked', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parental-rights')
  })

  it('navigates to /informationsharing on valid form submission using checkboxes', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await fillValidForm()
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/informationsharing')
  })

  it('navigates to /informationsharing when descriptions are provided instead of checkboxes', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.type(
      document.querySelector('#transportationArrangementDescription'),
      'We will alternate pick-up'
    )
    await userEvent.type(
      document.querySelector('#activityArrangementDescription'),
      'Both parents attend all events'
    )
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="no"]')
    )
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="no"]')
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/informationsharing')
  })

  it('navigates to /informationsharing when "Sometimes" is selected with a description filled', async () => {
    renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    await userEvent.click(document.querySelector('#hide-checkbox-activity'))
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="sometimes"]')
    )
    await userEvent.type(
      document.querySelector('#communicationWithCoParentOnPhoneDescription'),
      'Only during scheduled call times'
    )
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="yes"]')
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/informationsharing')
  })

  // ─── Global State / Persistence ───────────────────────────────────────────

  it('persists transportation checkbox when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(document.querySelector('#hide-checkbox-transportation'))
    unmount()
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(document.querySelector('#hide-checkbox-transportation')).toBeChecked()
  })

  it('persists transportation description text when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.type(
      document.querySelector('#transportationArrangementDescription'),
      'Alternate pick-up'
    )
    unmount()
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(document.querySelector('#transportationArrangementDescription')).toHaveValue('Alternate pick-up')
  })

  it('persists phone communication selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    )
    unmount()
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      document.querySelector('input[name="communicationWithCoParentOnPhone"][value="yes"]')
    ).toBeChecked()
  })

  it('persists notify co-parent selection when returning to the page', async () => {
    const { unmount } = renderWithRouter(<ParentingTimeAndCommunication />)
    await userEvent.click(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="no"]')
    )
    unmount()
    renderWithRouter(<ParentingTimeAndCommunication />)
    expect(
      document.querySelector('input[name="notifyCoParentOfChildRelatedEvents"][value="no"]')
    ).toBeChecked()
  })
})