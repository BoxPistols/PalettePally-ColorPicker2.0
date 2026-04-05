/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportHubDialog } from '@/components/export/ExportHubDialog';
import { PaletteData } from '@/lib/types/palette';

// Mock URL.createObjectURL / revokeObjectURL for download tests
beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    value: jest.fn(() => 'blob:mock'),
    writable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), writable: true });
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: jest.fn() },
});

const sampleData: PaletteData = {
  numColors: 1,
  colors: ['#1976d2'],
  names: ['primary'],
  palette: [
    {
      primary: {
        light: { main: '#1976d2', dark: '#115293', light: '#42a5f5', lighter: '#e3f2fd', contrastText: '#ffffff' },
        dark: { main: '#90caf9', dark: '#64b5f6', light: '#bbdefb', lighter: '#1e3a5f', contrastText: '#000000' },
      },
    },
  ],
  themeTokens: null,
};

describe('ExportHubDialog', () => {
  it('renders title', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    expect(screen.getByText('Export Palette')).toBeInTheDocument();
  });

  it('renders all 8 format tabs', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    expect(screen.getByText('JSON (Native)')).toBeInTheDocument();
    expect(screen.getByText('DTCG')).toBeInTheDocument();
    expect(screen.getByText('Tokens Studio')).toBeInTheDocument();
    expect(screen.getByText('CSS Variables')).toBeInTheDocument();
    expect(screen.getByText('SCSS Variables')).toBeInTheDocument();
    expect(screen.getByText('MUI Theme (TS)')).toBeInTheDocument();
    expect(screen.getByText('Tailwind Config')).toBeInTheDocument();
    expect(screen.getByText('Claude MCP Prompt')).toBeInTheDocument();
  });

  it('shows JSON preview by default', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    // JSON preview contains field name "colors"
    expect(screen.getByText(/"colors":/)).toBeInTheDocument();
  });

  it('switches to CSS tab when clicked', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    fireEvent.click(screen.getByText('CSS Variables'));
    expect(screen.getByText(/:root \{/)).toBeInTheDocument();
  });

  it('copies content to clipboard when Copy clicked', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('shows PNG download buttons', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    expect(screen.getByText('PNG (Light)')).toBeInTheDocument();
    expect(screen.getByText('PNG (Dark)')).toBeInTheDocument();
  });

  it('shows Download button for text formats', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    render(<ExportHubDialog open={false} onClose={() => {}} paletteData={sampleData} />);
    expect(screen.queryByText('Export Palette')).not.toBeInTheDocument();
  });

  it('switches to MUI Theme tab and shows TS code', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    fireEvent.click(screen.getByText('MUI Theme (TS)'));
    expect(screen.getByText(/createTheme/)).toBeInTheDocument();
  });

  it('switches to Tailwind tab', () => {
    render(<ExportHubDialog open={true} onClose={() => {}} paletteData={sampleData} />);
    fireEvent.click(screen.getByText('Tailwind Config'));
    expect(screen.getByText(/module.exports/)).toBeInTheDocument();
  });
});
