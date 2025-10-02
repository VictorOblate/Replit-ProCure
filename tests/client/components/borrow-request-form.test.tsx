import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BorrowRequestForm } from '../../../client/src/components/forms/borrow-request-form';

describe('BorrowRequestForm', () => {
  it('renders form fields correctly', () => {
    render(<BorrowRequestForm onSuccess={() => {}} />);
    
    // Check for essential form elements
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/justification/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/required date/i)).toBeInTheDocument();
  });
});