/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportHubDialog } from '@/components/export/ImportHubDialog';

describe('ImportHubDialog', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
    onImport: () => {},
    onConfirm: async () => true,
  };

  it('renders title and textarea', () => {
    render(<ImportHubDialog {...defaultProps} />);
    expect(screen.getByText('Import Palette')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste JSON content/)).toBeInTheDocument();
  });

  it('Import button disabled when no content', () => {
    render(<ImportHubDialog {...defaultProps} />);
    const importBtn = screen.getByText(/^Import$/).closest('button');
    expect(importBtn).toBeDisabled();
  });

  it('detects and shows JSON format chip', () => {
    render(<ImportHubDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          colors: ['#ff0000'],
          names: ['primary'],
          palette: [],
        }),
      },
    });
    expect(screen.getByText('JSON (Native)')).toBeInTheDocument();
  });

  it('detects Tokens Studio format', () => {
    render(<ImportHubDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          global: {
            color: {
              primary: { light: { main: { value: '#ff0000' } } },
            },
          },
        }),
      },
    });
    expect(screen.getByText('Tokens Studio')).toBeInTheDocument();
  });

  it('shows error for invalid JSON', () => {
    render(<ImportHubDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, { target: { value: 'not json' } });
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('enables Import when valid JSON pasted', () => {
    render(<ImportHubDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          colors: ['#ff0000'],
          names: ['primary'],
          palette: [],
        }),
      },
    });
    const importBtn = screen.getByText(/^Import$/).closest('button');
    expect(importBtn).not.toBeDisabled();
  });

  it('calls onImport + onClose on Import click', async () => {
    const onImport = jest.fn();
    const onClose = jest.fn();
    const onConfirm = jest.fn(async () => true);
    render(
      <ImportHubDialog
        {...defaultProps}
        onImport={onImport}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          colors: ['#ff0000'],
          names: ['primary'],
          palette: [],
        }),
      },
    });
    fireEvent.click(screen.getByText(/^Import$/));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    await waitFor(() => expect(onImport).toHaveBeenCalled());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('does not import when confirmation declined', async () => {
    const onImport = jest.fn();
    render(
      <ImportHubDialog
        {...defaultProps}
        onImport={onImport}
        onConfirm={async () => false}
      />
    );
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          colors: ['#ff0000'],
          names: ['primary'],
          palette: [],
        }),
      },
    });
    fireEvent.click(screen.getByText(/^Import$/));
    await waitFor(() => {
      expect(onImport).not.toHaveBeenCalled();
    });
  });

  it('shows DTCG warning for partial import', () => {
    render(<ImportHubDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Paste JSON content/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          'action-colors': { primary: {} },
        }),
      },
    });
    expect(screen.getByText(/部分的インポート/)).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    render(<ImportHubDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Import Palette')).not.toBeInTheDocument();
  });
});
