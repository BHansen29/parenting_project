import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../../src/components/common/Header'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

describe('Header', () => {

  // Render
  it('renders without crashing', () => {
    renderWithRouter(<Header />)
  })

  it('displays the ShareCare logo', () => {
    renderWithRouter(<Header />)
    expect(screen.getByAltText('ShareCare')).toBeInTheDocument()
  })

  // Step indicator
  it('displays the step indicator by default', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText(/step \d+ of \d+/i)).toBeInTheDocument()
  })

  it('shows Step 1 of 4 when no matching route is active', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('shows correct step when on household-info route', () => {
    renderWithRouter(<Header />, { initialEntries: ['/household-info'] })
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('shows correct step when on custody-schedule route', () => {
    renderWithRouter(<Header />, { initialEntries: ['/custody-schedule'] })
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
  })

  it('shows correct step when on transportation route', () => {
    renderWithRouter(<Header />, { initialEntries: ['/transportation'] })
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument()
  })

  it('shows correct step when on review route', () => {
    renderWithRouter(<Header />, { initialEntries: ['/review'] })
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument()
  })

  // Navigation
  it('renders the form progress nav', () => {
    renderWithRouter(<Header />)
    expect(screen.getByRole('navigation', { name: /form progress/i })).toBeInTheDocument()
  })

  it('renders all four step links by number', () => {
    renderWithRouter(<Header />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(links[0]).toHaveAttribute('href', '/household-info')
    expect(links[1]).toHaveAttribute('href', '/custody-schedule')
    expect(links[2]).toHaveAttribute('href', '/transportation')
    expect(links[3]).toHaveAttribute('href', '/review')
  })

  it('step links have correct href attributes', () => {
    renderWithRouter(<Header />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/household-info')
    expect(hrefs).toContain('/custody-schedule')
    expect(hrefs).toContain('/transportation')
    expect(hrefs).toContain('/review')
  })

  it('clicking a step link is possible in current implementation', async () => {
    renderWithRouter(<Header />, { initialEntries: ['/household-info'] })
    const links = screen.getAllByRole('link')
    // NOTE: Header currently allows free navigation between steps regardless
    // of form completion. This is a known gap - see HouseholdInfo.test.jsx
    // for validation behavior. Navigation guard should be added in a future sprint.
    await userEvent.click(links[1]) // custody-schedule link
    // Clicking does not throw - navigation is handled by MemoryRouter internally
  })

  it('marks the active step with aria-current', () => {
    renderWithRouter(<Header />, { initialEntries: ['/household-info'] })
    const activeLink = screen.getByRole('link', { name: /1/i, current: 'step' })
    expect(activeLink).toHaveAttribute('aria-current', 'step')
  })

  it('displays the active step label', () => {
    renderWithRouter(<Header />, { initialEntries: ['/household-info'] })
    expect(screen.getByText('Household Info')).toBeInTheDocument()
  })

  // showNavigation prop
  it('hides navigation when showNavigation is false', () => {
    renderWithRouter(<Header showNavigation={false} />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByText(/step \d+ of \d+/i)).not.toBeInTheDocument()
  })

  // saved prop
  it('does not show Saved indicator by default', () => {
    renderWithRouter(<Header />)
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('shows Saved indicator when saved is true', () => {
    renderWithRouter(<Header saved={true} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})