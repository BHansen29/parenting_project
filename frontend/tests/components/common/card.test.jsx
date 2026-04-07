import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../../../src/components/common/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders without crashing', () => {
      render(<Card>Test Content</Card>);
    });

    it('renders children', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Test</Card>);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<Card>Test</Card>);
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    });

    it('spreads additional props', () => {
      const { container } = render(<Card data-testid="test-card">Test</Card>);
      expect(container.querySelector('[data-testid="test-card"]')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders without crashing', () => {
      render(<CardHeader>Header Content</CardHeader>);
    });

    it('renders children', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
      expect(container.querySelector('.custom-header')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders without crashing', () => {
      render(<CardTitle>Title</CardTitle>);
    });

    it('renders as h4 element', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H4');
    });

    it('renders children', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardTitle className="custom-title">Title</CardTitle>);
      expect(container.querySelector('.custom-title')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('renders without crashing', () => {
      render(<CardDescription>Description</CardDescription>);
    });

    it('renders as p element', () => {
      render(<CardDescription>Description</CardDescription>);
      const desc = screen.getByText('Description');
      expect(desc.tagName).toBe('P');
    });

    it('renders children', () => {
      render(<CardDescription>Card Description</CardDescription>);
      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardDescription className="custom-desc">Desc</CardDescription>);
      expect(container.querySelector('.custom-desc')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<CardDescription>Desc</CardDescription>);
      expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
    });
  });

  describe('CardAction', () => {
    it('renders without crashing', () => {
      render(<CardAction>Action</CardAction>);
    });

    it('renders children', () => {
      render(<CardAction>Action Content</CardAction>);
      expect(screen.getByText('Action Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardAction className="custom-action">Action</CardAction>);
      expect(container.querySelector('.custom-action')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<CardAction>Action</CardAction>);
      expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders without crashing', () => {
      render(<CardContent>Content</CardContent>);
    });

    it('renders children', () => {
      render(<CardContent>Card Content</CardContent>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>);
      expect(container.querySelector('.custom-content')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('renders without crashing', () => {
      render(<CardFooter>Footer</CardFooter>);
    });

    it('renders children', () => {
      render(<CardFooter>Card Footer</CardFooter>);
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      expect(container.querySelector('.custom-footer')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
    });
  });

  describe('Complete Card composition', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });
  });
});
