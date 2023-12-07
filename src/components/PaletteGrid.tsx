import React from 'react'
import { Grid, Box } from '@mui/material'
import chroma from 'chroma-js'

type PaletteGridProps = {
  palette: { [colorName: string]: { [shade: string]: string } }[]
  colorNames: string[]
}

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
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <b>{colorNames[i]}</b>
          {colorGroup[colorNames[i]] &&
            Object.entries(colorGroup[colorNames[i]]).map(
              ([shade, colorValue]) => (
                <Box
                  my={1}
                  px={1}
                  key={shade}
                  sx={{
                    flexGrow: 1,
                    background: colorValue || 'transparent',
                    borderRadius: '5px',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
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
              )
            )}
        </Grid>
      ))}
    </Grid>
  )
}

export default PaletteGrid
