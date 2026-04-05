/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { HarmonyDialog } from '@/components/harmony/HarmonyDialog';
import { FigmaConnectDialog } from '@/components/figma/FigmaConnectDialog';
import { SavePaletteDialog } from '@/components/palette/SavePaletteDialog';

expect.extend(toHaveNoViolations);

describe('Accessibility (axe-core)', () => {
  it('ConfirmDialog has no violations', async () => {
    const { container } = render(
      <ConfirmDialog
        state={{
          open: true,
          title: 'Delete Item',
          message: 'Are you sure?',
        }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('HarmonyDialog has no violations', async () => {
    const { container } = render(
      <HarmonyDialog
        open={true}
        onClose={() => {}}
        baseColor='#1976d2'
        count={3}
        onApply={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FigmaConnectDialog has no violations', async () => {
    const { container } = render(
      <FigmaConnectDialog open={true} onClose={() => {}} onConnect={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SavePaletteDialog has no violations', async () => {
    const { container } = render(
      <SavePaletteDialog
        open={true}
        onClose={() => {}}
        onSave={async () => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
