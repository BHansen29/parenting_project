import { screen } from '@testing-library/react';
import ParentalRights from '../../src/pages/ParentalRights';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('ParentalRights Page', () => {
  it('renders without crashing', () => {
    renderWithRouter(<ParentalRights />);
  });

  it('renders form elements', () => {
    renderWithRouter(<ParentalRights />);
    // Check that there are radio buttons or checkboxes on the page
    const inputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
