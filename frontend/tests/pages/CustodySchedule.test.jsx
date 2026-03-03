import { screen } from '@testing-library/react';
import CustodySchedule from '../../src/pages/CustodySchedule';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('CustodySchedule Page', () => {
  it('renders without crashing', () => {
    renderWithRouter(<CustodySchedule />);
  });

  it('displays page heading', () => {
    renderWithRouter(<CustodySchedule />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

});
