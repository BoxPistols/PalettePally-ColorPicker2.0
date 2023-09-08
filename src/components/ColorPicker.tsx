import React, { ChangeEvent, useEffect, useState } from "react"
import {
  Box,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  styled,
  InputLabel,
} from "@mui/material"
import { SketchPicker } from "react-color"
import chroma from "chroma-js"

type ColorInputFieldProps = {
  color: string
  onChange: (newColor: string) => void
}

type PaletteType = { [colorName: string]: { [shade: string]: string } }[]

const shades = {
  main: 0,
  dark: -2,
  light: 1.25,
  lighter: 4,
}

const FlexBox = styled(Box)`
  display: flex;
  align-items: center;
`

const StyledInputLabel = styled(InputLabel)`
  && {
    transform: none !important;
    transition: none !important;
  }
`

function ColorInputField({ color, onChange }: ColorInputFieldProps) {
  return (
    <>
      <Box
        sx={{
          display: "block",
          pb: 2,
          overflow: "auto",
          maxWidth: "90vw",
        }}
      >
        <FlexBox
          sx={{
            mb: 1.5,
            gap: 1,
            border: "1px solid #f9f9fc",
          }}
        >
          <SketchPicker
            color={color}
            onChange={(updatedColor: { hex: string }) =>
              onChange(updatedColor.hex)
            }
          />
        </FlexBox>
        <StyledInputLabel shrink={false} htmlFor="hex-color" size="small">
          Hex Color
        </StyledInputLabel>
        <TextField
          id="hex-color"
          value={color}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          size="small"
          sx={{ pl: 0 }}
        />
      </Box>
    </>
  )
}

function ColorPicker() {
  const [numColors, setNumColors] = useState(4)
  const [color, setColor] = useState<string[]>([])
  const [palette, setPalette] = useState<PaletteType | null>(null)
  const [colorNames, setColorNames] = useState(
    Array.from({ length: numColors }, (_, i) => `color${i + 1}`)
  )

  const [showDialog, setShowDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState("")

  useEffect(() => {
    if (numColors > color.length) {
      const additionalColors = Array.from(
        { length: numColors - color.length },
        (_, i) =>
          chroma.hsl(((i + color.length) * 360) / numColors, 0.85, 0.5).hex()
      )
      setColor((prevColors) => [...prevColors, ...additionalColors])
      setColorNames((prevNames) => [
        ...prevNames,
        ...Array.from(
          { length: additionalColors.length },
          (_, i) => `color${i + prevNames.length + 1}`
        ),
      ])
    } else if (numColors < color.length) {
      setColor((prevColors) => prevColors.slice(0, numColors))
      setColorNames((prevNames) => prevNames.slice(0, numColors))
    }
  }, [color.length, numColors])

  function handleGenerateClick() {
    const newPalette = color.map((c, idx) => {
      const baseColor = chroma(c)
      const baseHSL = baseColor.hsl()

      const adjustedColors = Object.fromEntries(
        Object.entries(shades).map(([shade, adjustment]) => {
          if (shade === "main") {
            return [shade, baseColor.hex()] // mainカラーは元の色と一致させる
          }
          const [h, s, l] = baseHSL
          return [shade, chroma.hsl(h, s * 0.85, l + adjustment * 0.1).hex()]
        })
      )

      return { [colorNames[idx]]: adjustedColors }
    })
    setPalette(newPalette)
  }

  const handleColorNameChange = (index: number, newName: string) => {
    const newColorNames = [...colorNames]
    const oldName = newColorNames[index]
    newColorNames[index] = newName

    if (palette) {
      const newPalette = palette.map((colorGroup) => {
        if (colorGroup[oldName]) {
          const updatedGroup = { ...colorGroup }
          updatedGroup[newName] = updatedGroup[oldName]
          delete updatedGroup[oldName]
          return updatedGroup
        }
        return colorGroup
      })
      setPalette(newPalette)
    }

    setColorNames(newColorNames)
  }

  const exportToJson = () => {
    const data = {
      // colors: color,
      // names: colorNames,
      palette: palette,
    }
    openDialog(JSON.stringify(data, null, 2))
  }

  const importFromJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target !== null) {
          const data = JSON.parse(e.target.result as string)
          setColor(data.colors)
          setColorNames(data.names)
          setPalette(data.palette)
        }
      }
      reader.readAsText(file)
    }
  }

  const openDialog = (content: React.SetStateAction<string>) => {
    setDialogContent(content)
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <StyledInputLabel shrink={false} htmlFor="color-length">
          カラー数↓↑
        </StyledInputLabel>
        <TextField
          id="color-length"
          value={numColors}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const num = parseInt(e.target.value, 10)
            if (!isNaN(num) && num > 0) {
              setNumColors(num)
            }
          }}
          type="number"
          inputProps={{ min: 1, max: 24 }}
          fullWidth
          sx={{ mb: 1, width: 100, marginRight: 2 }}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateClick}
          size="small"
        >
          カラーパレット生成 / 再生成
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={exportToJson}
          size="small"
        >
          Export JSON
        </Button>
        <input type="file" onChange={importFromJson} />
      </Box>
      <FlexBox
        sx={{
          flexDirection: "row",
          gap: 2,
          overflow: "auto",
          maxWidth: "90vw",
        }}
      >
        {Array.from({ length: numColors }, (_, i) => (
          <React.Fragment key={i}>
            <FlexBox sx={{ display: "block" }}>
              <TextField
                value={colorNames[i]}
                onChange={(e) => handleColorNameChange(i, e.target.value)}
                size="small"
              />
              <ColorInputField
                color={color[i]}
                onChange={(newColor) => {
                  const colorsCopy = [...color]
                  colorsCopy[i] = newColor
                  setColor(colorsCopy)
                }}
              />
            </FlexBox>
          </React.Fragment>
        ))}
      </FlexBox>
      {palette && (
        <Grid container spacing={2} mt={2}>
          {palette.map((colorGroup, i) => (
            <Grid
              item
              xs={6}
              md={3}
              lg={2}
              key={i}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <b>{colorNames[i]}</b>
              {colorGroup[colorNames[i]] &&
                Object.entries(colorGroup[colorNames[i]]).map(
                  ([shade, colorValue]) => (
                    <Box
                      m={1}
                      px={2}
                      key={shade}
                      sx={{
                        flexGrow: 1,
                        background: colorValue || "transparent",
                        borderRadius: "6px",
                        color:
                          chroma(colorValue as string).luminance() > 0.5
                            ? "black"
                            : "white",
                      }}
                    >
                      <Box p={1} sx={{ borderRadius: "6px" }}>
                        {shade}: {colorValue}
                      </Box>
                    </Box>
                  )
                )}
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={showDialog} onClose={closeDialog}>
        <DialogContent
          sx={{
            minWidth: "70vw",
          }}
        >
          <pre>{dialogContent}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ColorPicker
