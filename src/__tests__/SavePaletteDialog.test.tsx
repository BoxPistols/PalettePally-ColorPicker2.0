/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SavePaletteDialog } from '@/components/palette/SavePaletteDialog';

describe('SavePaletteDialog', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    onSave: async () => {},
  };

  it('renders Save title by default', () => {
    render(<SavePaletteDialog {...defaultProps} />);
    expect(screen.getByText('Save Palette')).toBeInTheDocument();
  });

  it('renders Update title when isUpdate=true', () => {
    render(<SavePaletteDialog {...defaultProps} isUpdate />);
    expect(screen.getByText('Update Palette')).toBeInTheDocument();
  });

  it('pre-fills name from defaultName', () => {
    render(<SavePaletteDialog {...defaultProps} defaultName='My Palette' />);
    expect(screen.getByDisplayValue('My Palette')).toBeInTheDocument();
  });

  it('Save button disabled when name is empty', () => {
    render(<SavePaletteDialog {...defaultProps} />);
    const saveBtn = screen.getByText('Save').closest('button');
    expect(saveBtn).toBeDisabled();
  });

  it('Save button enabled after typing a name', () => {
    render(<SavePaletteDialog {...defaultProps} />);
    const nameInput = screen.getByLabelText('Palette Name');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    const saveBtn = screen.getByText('Save').closest('button');
    expect(saveBtn).not.toBeDisabled();
  });

  it('calls onSave with name and description', async () => {
    const onSave = jest.fn(async () => {});
    const onClose = jest.fn();
    render(<SavePaletteDialog {...defaultProps} onSave={onSave} onClose={onClose} />);
    const nameInput = screen.getByLabelText('Palette Name');
    fireEvent.change(nameInput, { target: { value: 'My Brand' } });
    const descInput = screen.getByLabelText('Description (optional)');
    fireEvent.change(descInput, { target: { value: 'Company colors' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('My Brand', 'Company colors');
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows error on save failure', async () => {
    const onSave = jest.fn(async () => {
      throw new Error('Network error');
    });
    render(<SavePaletteDialog {...defaultProps} onSave={onSave} />);
    const nameInput = screen.getByLabelText('Palette Name');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = jest.fn();
    render(<SavePaletteDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('trims whitespace from name and description', async () => {
    const onSave = jest.fn(async () => {});
    render(<SavePaletteDialog {...defaultProps} onSave={onSave} />);
    const nameInput = screen.getByLabelText('Palette Name');
    fireEvent.change(nameInput, { target: { value: '  Spaced  ' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Spaced', '');
    });
  });
});
