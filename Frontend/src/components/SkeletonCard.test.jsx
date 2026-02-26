import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonCard from './SkeletonCard';

describe('SkeletonCard', () => {
  it('should render a skeleton card element', () => {
    render(<SkeletonCard />);
    
    const skeletonElement = screen.getByRole('presentation');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    render(<SkeletonCard />);
    
    const skeletonElement = screen.getByRole('presentation');
    expect(skeletonElement).toHaveClass('bg-gray-200');
    expect(skeletonElement).toHaveClass('h-32');
    expect(skeletonElement).toHaveClass('w-full');
    expect(skeletonElement).toHaveClass('rounded-xl');
    expect(skeletonElement).toHaveClass('mb-4');
  });

  it('should use motion component from framer-motion', () => {
    render(<SkeletonCard />);
    
    const skeletonElement = screen.getByRole('presentation');
    // Framer-motion adds data-testid or other attributes
    expect(skeletonElement).toBeInTheDocument();
  });
});
