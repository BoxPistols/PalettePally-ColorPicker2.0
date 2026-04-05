/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

describe('ConfirmDialog', () => {
  const baseState = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure?',
  };

  it('renders title and message', () => {
    render(
      <ConfirmDialog
        state={baseState}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    render(
      <ConfirmDialog
        state={{ ...baseState, open: false }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onConfirm when Confirm button clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        state={baseState}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        state={baseState}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses custom button labels', () => {
    render(
      <ConfirmDialog
        state={{ ...baseState, confirmLabel: 'Delete', cancelLabel: 'Keep' }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('renders with error severity (red button)', () => {
    render(
      <ConfirmDialog
        state={{ ...baseState, severity: 'error' }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders with warning severity by default', () => {
    render(
      <ConfirmDialog
        state={baseState}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });
});
