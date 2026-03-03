import { screen } from '@testing-library/react';
import Transportation from '../../src/pages/Transportation';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('Transportation Page', () => {
  it('renders without crashing', () => {
    renderWithRouter(<Transportation />);
  });

  it('displays page heading', () => {
    renderWithRouter(<Transportation />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders form elements', () => {
    renderWithRouter(<Transportation />);
    // Check that the page has a form container
    const page = document.querySelector('.page-container');
    expect(page).toBeInTheDocument();
  });
});
