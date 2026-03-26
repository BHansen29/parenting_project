import { screen } from '@testing-library/react';
import CustodySchedule from '../../src/pages/CustodySchedule';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('CustodySchedule Page', () => {
  it('renders without crashing', () => {
    renderWithRouter(<CustodySchedule />);
  });

});
