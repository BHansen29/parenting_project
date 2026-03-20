import { screen, fireEvent } from '@testing-library/react';
import GettingStarted from '../../src/pages/GettingStarted';
import { renderWithRouter } from '../../src/utils/renderWithRouter';

describe('GettingStarted Page', () => {
  // Basic rendering tests
  it('renders without crashing', () => {
    renderWithRouter(<GettingStarted />);
  });

  it('displays page heading', () => {
    renderWithRouter(<GettingStarted />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders form sections', () => {
    renderWithRouter(<GettingStarted />);
    expect(screen.getByText('Safety & Privacy')).toBeInTheDocument();
    expect(screen.getByText('Your Information')).toBeInTheDocument();
    expect(screen.getByText('Case Filing Status')).toBeInTheDocument();
    expect(screen.getByText('Your Children')).toBeInTheDocument();
  });

  // Children section - initial state
  describe('Children Section - Initial State', () => {
    it('renders one child by default', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('renders child input fields', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    });

    it('renders child classification radio buttons', () => {
      renderWithRouter(<GettingStarted />);
      const minorRadio = screen.getByText(/the child is a minor and\/or mentally or physically disabled/i);
      const emancipatedRadio = screen.getByText(/the child is an emancipated adult/i);
      expect(minorRadio).toBeInTheDocument();
      expect(emancipatedRadio).toBeInTheDocument();
    });

    it('renders "Add Another Child" button', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.getByRole('button', { name: /add another child/i })).toBeInTheDocument();
    });

    it('does not show Remove button when only one child exists', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.queryByRole('button', { name: /remove child 1/i })).not.toBeInTheDocument();
    });
  });

  // Add children functionality
  describe('Add Children Functionality', () => {
    it('adds a second child when "Add Another Child" is clicked', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      fireEvent.click(addButton);

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('adds multiple children sequentially', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      fireEvent.click(addButton); // Add child 2
      fireEvent.click(addButton); // Add child 3
      fireEvent.click(addButton); // Add child 4

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
      expect(screen.getByText('Child 4')).toBeInTheDocument();
    });

    it('newly added children have empty input fields', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      fireEvent.click(addButton);

      // Get all first name inputs - the second one should be for the new child
      const firstNameInputs = screen.getAllByLabelText(/first name/i);
      const secondChildFirstName = firstNameInputs[firstNameInputs.length - 1];
      expect(secondChildFirstName).toHaveValue('');
    });

    it('each child has unique IDs for their inputs', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      fireEvent.click(addButton);

      const firstNameInputs = screen.getAllByLabelText(/first name/i);
      expect(firstNameInputs[0]).toHaveAttribute('id', 'child-1-firstName');
      expect(firstNameInputs[1]).toHaveAttribute('id', 'child-2-firstName');
    });
  });

  // Remove children functionality
  describe('Remove Children Functionality', () => {
    it('shows Remove button when multiple children exist', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      fireEvent.click(addButton);

      expect(screen.getByRole('button', { name: /remove child 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove child 2/i })).toBeInTheDocument();
    });

    it('removes a child when Remove button is clicked', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      // Add a second child
      fireEvent.click(addButton);
      expect(screen.getByText('Child 2')).toBeInTheDocument();

      // Remove the second child
      const removeButton = screen.getByRole('button', { name: /remove child 2/i });
      fireEvent.click(removeButton);

      expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('can remove any child, not just the last one', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      // Add children 2 and 3
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();

      // Remove child 2 (middle one)
      const removeButton = screen.getByRole('button', { name: /remove child 2/i });
      fireEvent.click(removeButton);

      // Child 2 should be gone, but children 1 and 3 should remain
      expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('hides Remove button when back down to one child', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      // Add a second child
      fireEvent.click(addButton);

      // Remove the second child
      const removeButton = screen.getByRole('button', { name: /remove child 2/i });
      fireEvent.click(removeButton);

      // Should not show remove button when only one child remains
      expect(screen.queryByRole('button', { name: /remove child 1/i })).not.toBeInTheDocument();
    });

    it('maintains data for remaining children after removal', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      // Add children
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      // Fill in data for child 1
      const firstNameInputs = screen.getAllByLabelText(/first name/i);
      fireEvent.change(firstNameInputs[0], { target: { value: 'John' } });

      // Remove child 2
      const removeButton = screen.getByRole('button', { name: /remove child 2/i });
      fireEvent.click(removeButton);

      // Child 1's data should still be there
      const remainingFirstNameInputs = screen.getAllByLabelText(/first name/i);
      expect(remainingFirstNameInputs[0]).toHaveValue('John');
    });
  });

  // Child input functionality
  describe('Child Input Functionality', () => {
    it('updates child first name when typing', () => {
      renderWithRouter(<GettingStarted />);
      const firstNameInputs = screen.getAllByLabelText(/first name/i);
      const childFirstName = firstNameInputs[0]; // First child's first name

      fireEvent.change(childFirstName, { target: { value: 'Jane' } });

      expect(childFirstName).toHaveValue('Jane');
    });

    it('updates child last name when typing', () => {
      renderWithRouter(<GettingStarted />);
      const lastNameInputs = screen.getAllByLabelText(/last name/i);
      const childLastName = lastNameInputs[0];

      fireEvent.change(childLastName, { target: { value: 'Doe' } });

      expect(childLastName).toHaveValue('Doe');
    });

    it('updates child date of birth', () => {
      renderWithRouter(<GettingStarted />);
      const dateInput = screen.getByLabelText(/date of birth/i);

      fireEvent.change(dateInput, { target: { value: '2015-06-15' } });

      expect(dateInput).toHaveValue('2015-06-15');
    });

    it('updates child classification when radio is selected', () => {
      renderWithRouter(<GettingStarted />);
      const minorRadio = screen.getByRole('radio', { name: /the child is a minor/i });

      fireEvent.click(minorRadio);

      expect(minorRadio).toBeChecked();
    });

    it('each child has independent input fields', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });
      fireEvent.click(addButton);

      const firstNameInputs = screen.getAllByLabelText(/first name/i);

      // Type in first child's name
      fireEvent.change(firstNameInputs[0], { target: { value: 'Alice' } });

      // Type in second child's name
      fireEvent.change(firstNameInputs[1], { target: { value: 'Bob' } });

      // Both should have their own values
      expect(firstNameInputs[0]).toHaveValue('Alice');
      expect(firstNameInputs[1]).toHaveValue('Bob');
    });
  });

  // Complex workflows
  describe('Complex Add/Remove Workflows', () => {
    it('can add, remove, and add again', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      // Add child 2
      fireEvent.click(addButton);
      expect(screen.getByText('Child 2')).toBeInTheDocument();

      // Remove child 2
      const removeButton = screen.getByRole('button', { name: /remove child 2/i });
      fireEvent.click(removeButton);
      expect(screen.queryByText('Child 2')).not.toBeInTheDocument();

      // Add another child (should be child 3 because IDs increment)
      fireEvent.click(addButton);
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('renumbers children labels after removal', () => {
      renderWithRouter(<GettingStarted />);
      const addButton = screen.getByRole('button', { name: /add another child/i });

      // Add 3 children total
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();

      // Remove child 1
      const removeButton = screen.getByRole('button', { name: /remove child 1/i });
      fireEvent.click(removeButton);

      // Children should be renumbered as Child 1 and Child 2
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.queryByText('Child 3')).not.toBeInTheDocument();
    });
  });

  // Other form sections
  describe('Other Form Sections', () => {
    it('renders parent information inputs', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.getByPlaceholderText(/enter your first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your last name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your phone number/i)).toBeInTheDocument();
    });

    it('renders safety concern radio buttons', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.getByText(/yes, please keep my information private/i)).toBeInTheDocument();
      expect(screen.getByText(/no, i wish to collaborate with my co-parent/i)).toBeInTheDocument();
    });

    it('renders case filing status radio buttons', () => {
      renderWithRouter(<GettingStarted />);
      expect(screen.getByText(/yes, it was me/i)).toBeInTheDocument();
      expect(screen.getByText(/no, my co-parent filed/i)).toBeInTheDocument();
    });
  });
});
