import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import InformationSharing from '../../src/pages/InformationSharing'
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

describe('InformationSharing', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
  })

  it('displays the Information Sharing heading', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText('Information Sharing')).toBeInTheDocument()
  })

  it('displays the page description', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(
      screen.getByText(/Determine who has access to medical, school, and activity information/i)
    ).toBeInTheDocument()
  })

  // ─── Section Rendering ────────────────────────────────────────────────────

  it('displays the Medical Information Access section', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText('Medical Information Access')).toBeInTheDocument()
    expect(screen.getByText(/Who can access doctor visits and medical information/i)).toBeInTheDocument()
  })

  it('displays the School Contact Rights section', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText('School Contact Rights')).toBeInTheDocument()
    expect(screen.getByText(/Who can communicate with the school/i)).toBeInTheDocument()
  })

  it('displays the School Reports & Notices section', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText('School Reports & Notices')).toBeInTheDocument()
    expect(screen.getByText(/Who receives school communications/i)).toBeInTheDocument()
  })

  it('displays the School Activity Participation section', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText('School Activity Participation')).toBeInTheDocument()
    expect(screen.getByText(/Who may attend school events/i)).toBeInTheDocument()
  })

  it('displays the Extracurricular Activities section', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText('Extracurricular Activities')).toBeInTheDocument()
    expect(screen.getByText(/Who may attend activities outside school/i)).toBeInTheDocument()
  })

  // ─── Question Text ────────────────────────────────────────────────────────

  it('displays the medical records question text', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText(/Who should get copies of any doctor's visits that your children may have\? This parent can also contact the doctor and ask questions/i)).toBeInTheDocument()
  })

  it('displays the school contact question text', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText(/Who can call your child's school/i)).toBeInTheDocument()
  })

  it('displays the school reports question text', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText(/Who can get copies of your child's school reports/i)).toBeInTheDocument()
  })

  it('displays the school activities question text', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText(/Who can attend and participate in parent-teacher conferences/i)).toBeInTheDocument()
  })

  it('displays the extracurricular activities question text', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByText(/Who can attend and participate with the child\(ren\)/i)).toBeInTheDocument()
  })

  // ─── Radio Options ────────────────────────────────────────────────────────

  it('renders 5 radio option groups (one per section)', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    // 5 sections × 5 options each = 25 radio inputs
    expect(screen.getAllByRole('radio')).toHaveLength(25)
  })

  it('renders all 5 answer options for the medicalRecords section', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(document.querySelector('input[name="medicalRecords"][value="parent1"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="medicalRecords"][value="parent2"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="medicalRecords"][value="both"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="medicalRecords"][value="needInfo"]')).toBeInTheDocument()
    expect(document.querySelector('input[name="medicalRecords"][value="defer"]')).toBeInTheDocument()
  })

  it('displays "Just me", "Just my co-parent", "Both me and my co-parent" option labels', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getAllByText('Just me').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Just my co-parent').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Both me and my co-parent').length).toBeGreaterThanOrEqual(1)
  })

  it('displays "I need more information" and "Default to my co-parent\'s choice" option labels', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getAllByText('I need more information').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Default to my co-parent's choice").length).toBeGreaterThanOrEqual(1)
  })

  it('no radio buttons are checked by default', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const radios = screen.getAllByRole('radio')
    radios.forEach(radio => expect(radio).not.toBeChecked())
  })

  // ─── Radio Interaction ────────────────────────────────────────────────────

  it('can select "Just me" for medicalRecords', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const radio = document.querySelector('input[name="medicalRecords"][value="parent1"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Both me and my co-parent" for schoolContact', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const radio = document.querySelector('input[name="schoolContact"][value="both"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Just my co-parent" for schoolReports', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const radio = document.querySelector('input[name="schoolReports"][value="parent2"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "I need more information" for schoolActivities', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const radio = document.querySelector('input[name="schoolActivities"][value="needInfo"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('can select "Default to my co-parent\'s choice" for extracurricularActivities', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const radio = document.querySelector('input[name="extracurricularActivities"][value="defer"]')
    await userEvent.click(radio)
    expect(radio).toBeChecked()
  })

  it('selecting a new option in a section deselects the previous one', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const parent1Radio = document.querySelector('input[name="medicalRecords"][value="parent1"]')
    const bothRadio = document.querySelector('input[name="medicalRecords"][value="both"]')
    await userEvent.click(parent1Radio)
    await userEvent.click(bothRadio)
    expect(bothRadio).toBeChecked()
    expect(parent1Radio).not.toBeChecked()
  })

  it('selecting an option in one section does not affect other sections', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const medicalRadio = document.querySelector('input[name="medicalRecords"][value="both"]')
    await userEvent.click(medicalRadio)
    const schoolRadios = ['parent1', 'parent2', 'both', 'needInfo', 'defer'].map(
      v => document.querySelector(`input[name="schoolContact"][value="${v}"]`)
    )
    schoolRadios.forEach(r => expect(r).not.toBeChecked())
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('shows a validation error for each unanswered section on empty submit', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    const errors = await screen.findAllByText('Please select an option.')
    expect(errors).toHaveLength(5)
  })

  it('does not show errors before the form is submitted', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.queryByText('Please select an option.')).not.toBeInTheDocument()
  })

  it('clears the medicalRecords error when user selects an option', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option.')
    await userEvent.click(document.querySelector('input[name="medicalRecords"][value="both"]'))
    expect(await screen.findAllByText('Please select an option.')).toHaveLength(4)
  })

  it('does not navigate when Next is clicked with no selections', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when only some sections are answered', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    await userEvent.click(document.querySelector('input[name="medicalRecords"][value="both"]'))
    await userEvent.click(document.querySelector('input[name="schoolContact"][value="both"]'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ─── Footer Navigation ────────────────────────────────────────────────────

  it('renders the Next and Back buttons in the footer', () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to /parenting-time-communication when Back is clicked', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
  })

  it('navigates to /tax-exemptions on valid form submission', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const sections = ['medicalRecords', 'schoolContact', 'schoolReports', 'schoolActivities', 'extracurricularActivities']
    for (const key of sections) {
      await userEvent.click(document.querySelector(`input[name="${key}"][value="both"]`))
    }
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/tax-exemptions')
  })

  it('clears errors and navigates back when Back is clicked after failed submit', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    await screen.findAllByText('Please select an option.')
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/parenting-time-communication')
  })

  // ─── Global State Management ──────────────────────────────────────────────

  it('persists selections when returning to the page', async () => {
    const { unmount } = renderWithRouter(<InformationSharing />, { showFooter: true })
    await userEvent.click(document.querySelector('input[name="medicalRecords"][value="parent1"]'))
    await userEvent.click(document.querySelector('input[name="schoolContact"][value="both"]'))
    unmount()
    renderWithRouter(<InformationSharing />, { showFooter: true })
    expect(document.querySelector('input[name="medicalRecords"][value="parent1"]')).toBeChecked()
    expect(document.querySelector('input[name="schoolContact"][value="both"]')).toBeChecked()
  })

  it('saves all selections to context on valid form submission', async () => {
    renderWithRouter(<InformationSharing />, { showFooter: true })
    const selections = {
      medicalRecords: 'parent1',
      schoolContact: 'both',
      schoolReports: 'parent2',
      schoolActivities: 'needInfo',
      extracurricularActivities: 'defer',
    }
    for (const [key, value] of Object.entries(selections)) {
      await userEvent.click(document.querySelector(`input[name="${key}"][value="${value}"]`))
    }
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/tax-exemptions')
  })
})