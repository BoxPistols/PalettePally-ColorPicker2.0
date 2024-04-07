import React, { memo } from 'react';
import { Grid, Box } from '@mui/material';
import chroma from 'chroma-js';

type PaletteGridProps = {
  palette: { [colorName: string]: { [shade: string]: string } }[];
  colorNames: string[];
};

const GridItem = memo<{
  colorGroup: { [shade: string]: string };
  colorName: string;
}>(({ colorGroup, colorName }) => (
  <>
    <b>{colorName}</b>
    {colorGroup &&
      Object.entries(colorGroup).map(([shade, colorValue]) => (
        <Box
          my={0.5}
          px={1}
          key={shade}
          sx={{
            flexGrow: 1,
            background: colorValue || 'transparent',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            boxShadow: '1px 1px 4px  rgba(0,0,0,0.1)',
            color:
              chroma(colorValue as string).luminance() > 0.5
                ? 'black'
                : 'white',
          }}
        >
          <Box p={1} sx={{ borderRadius: '6px' }}>
            {shade}: {colorValue}
          </Box>
        </Box>
      ))}
  </>
));

// メモ化したコンポーネントに表示名を設定
GridItem.displayName = 'GridItem';

function PaletteGrid({ palette, colorNames }: PaletteGridProps) {
  return (
    <Grid container spacing={2} mt={2}>
      {palette.map((colorGroup, i) => (
        <Grid
          item
          xs={6}
          md={3}
          lg={2}
          key={i}
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          <GridItem
            colorGroup={colorGroup[colorNames[i]]}
            colorName={colorNames[i]}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default PaletteGrid;
