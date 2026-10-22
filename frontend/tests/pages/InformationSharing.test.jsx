import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import InformationSharing from '../../src/pages/InformationSharing'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

const sectionKeys = ['medicalRecords', 'schoolContact', 'schoolActivities']

function textareaFor(key) {
  return document.querySelector(`#information-sharing-${key}`)
}

async function fillAllSections(values = {}) {
  for (const key of sectionKeys) {
    await userEvent.type(textareaFor(key), values[key] ?? `${key} response`)
  }
}

describe('InformationSharing', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  it('renders the page heading and description', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getByText('Information Sharing')).toBeInTheDocument()
    expect(
      screen.getByText(/Determine who has access to medical, school, and activity information/i)
    ).toBeInTheDocument()
  })

  it('renders the current information-sharing sections', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getByText('Medical Information Access')).toBeInTheDocument()
    expect(screen.getByText('School Contact Rights & Access to Information')).toBeInTheDocument()
    expect(screen.getByText('School Activity Participation')).toBeInTheDocument()
  })

  it('renders one required textarea for each section', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    sectionKeys.forEach((key) => {
      expect(textareaFor(key)).toHaveAttribute('required')
      expect(textareaFor(key)).toHaveAttribute('placeholder', expect.stringContaining('Enter'))
    })
  })

  it('renders the current questions and default-rights descriptions', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getAllByText(/Do you agree to these default rights\?/i)).toHaveLength(3)
    expect(screen.getByText(/the right to participate in major decisions/i)).toBeInTheDocument()
    expect(screen.getByText(/the right to talk with school officials/i)).toBeInTheDocument()
    expect(screen.getByText(/parent-teacher conferences, school trips/i)).toBeInTheDocument()
  })

  it('updates each section response', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.type(textareaFor('medicalRecords'), 'Medical response')
    await userEvent.type(textareaFor('schoolContact'), 'School response')
    await userEvent.type(textareaFor('schoolActivities'), 'Activity response')

    expect(textareaFor('medicalRecords')).toHaveValue('Medical response')
    expect(textareaFor('schoolContact')).toHaveValue('School response')
    expect(textareaFor('schoolActivities')).toHaveValue('Activity response')
  })

  it('does not show validation errors before submission', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.queryByText('Please enter a response.')).not.toBeInTheDocument()
  })

  it('shows a validation error for each unanswered section on empty submit', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(await screen.findAllByText('Please enter a response.')).toHaveLength(3)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('clears a section error when that section receives a response', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please enter a response.')
    await userEvent.type(textareaFor('medicalRecords'), 'Medical response')

    await waitFor(() => {
      expect(screen.getAllByText('Please enter a response.')).toHaveLength(2)
    })
  })

  it('does not navigate when only some sections are answered', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.type(textareaFor('medicalRecords'), 'Medical response')
    await userEvent.type(textareaFor('schoolContact'), 'School response')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(await screen.findByText('Please enter a response.')).toBeInTheDocument()
  })

  it('renders the Next and Back buttons', () => {
    renderWithRouter(<InformationSharing />)

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates back to parenting time and communication', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
  })

  it('clears validation errors when navigating back', async () => {
    renderWithRouter(<InformationSharing />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please enter a response.')
    await userEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
    expect(screen.queryByText('Please enter a response.')).not.toBeInTheDocument()
  })

  it('navigates to tax exemptions after all sections are answered', async () => {
    renderWithRouter(<InformationSharing />)

    await fillAllSections()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tax-exemptions')
    })
  })

  it('persists responses when returning to the page', async () => {
    const { unmount } = renderWithRouter(<InformationSharing />)
    await fillAllSections({
      medicalRecords: 'Medical response',
      schoolContact: 'School response',
      schoolActivities: 'Activity response',
    })
    unmount()

    renderWithRouter(<InformationSharing />)

    expect(textareaFor('medicalRecords')).toHaveValue('Medical response')
    expect(textareaFor('schoolContact')).toHaveValue('School response')
    expect(textareaFor('schoolActivities')).toHaveValue('Activity response')
  })

  it('treats legacy radio answers as empty text responses', () => {
    localStorage.setItem('sharedCareForm', JSON.stringify({
      informationSharing: {
        medicalRecords: 'parent1',
        schoolContact: 'both',
        schoolActivities: 'needInfo',
      },
    }))
    renderWithRouter(<InformationSharing />)

    sectionKeys.forEach((key) => {
      expect(textareaFor(key)).toHaveValue('')
    })
  })

  it('does not submit whitespace-only responses', async () => {
    renderWithRouter(<InformationSharing />)

    sectionKeys.forEach((key) => fireEvent.change(textareaFor(key), { target: { value: '  ' } }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(await screen.findAllByText('Please enter a response.')).toHaveLength(3)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
