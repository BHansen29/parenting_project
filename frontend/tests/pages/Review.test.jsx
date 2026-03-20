import { screen } from '@testing-library/react';
import Review from '../../src/pages/Review';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('Review Page', () => {
  it('renders without crashing', () => {
    renderWithRouter(<Review />);
  });

  it('displays page heading', () => {
    renderWithRouter(<Review />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders review content', () => {
    renderWithRouter(<Review />);
    // Check that the page container exists
    const page = document.querySelector('.page-container');
    expect(page).toBeInTheDocument();
  });
});
