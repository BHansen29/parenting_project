import { screen } from '@testing-library/react'
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

  it('does not show Saved indicator by default', () => {
    renderWithRouter(<Header />)
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('shows Saved indicator when saved is true', () => {
    renderWithRouter(<Header saved={true} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('renders without crashing when showNavigation is false', () => {
    renderWithRouter(<Header showNavigation={false} />)
    expect(screen.getByAltText('ShareCare')).toBeInTheDocument()
  })

})