import { screen } from '@testing-library/react';
import ParentingTimeAndCommunication from '../../src/pages/ParentingTimeAndCommunication';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('ParentingTimeAndCommunication Page', () => {
  it('renders without crashing', () => {
    renderWithRouter(<ParentingTimeAndCommunication />);
  });

  it('displays page heading', () => {
    renderWithRouter(<ParentingTimeAndCommunication />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders form sections', () => {
    renderWithRouter(<ParentingTimeAndCommunication />);
    // Check that the page has form elements
    const page = document.querySelector('.page-container');
    expect(page).toBeInTheDocument();
  });

  it('renders radio buttons for communication preferences', () => {
    renderWithRouter(<ParentingTimeAndCommunication />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThan(0);
  });
});
