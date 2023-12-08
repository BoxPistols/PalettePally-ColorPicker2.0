import React from 'react'
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material'

type PaletteData = {
  name: string
  value: string
}

type DialogBoxProps = {
  showDialog: boolean
  closeDialog: () => void
  downloadJSON: (data: PaletteData) => void
  dialogContent: string
}

function DialogBox({
  showDialog,
  closeDialog,
  downloadJSON,
  dialogContent,
}: DialogBoxProps) {
  return (
    <Dialog open={showDialog} onClose={closeDialog}>
      <DialogContent
        sx={{
          minWidth: '60vw',
        }}
      >
        <pre>
          <code>{dialogContent}</code>
        </pre>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => downloadJSON(JSON.parse(dialogContent))}
          sx={{ mr: 2 }}
        >
          ダウンロード
        </Button>
        <Button onClick={closeDialog} variant='outlined' color='secondary'>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogBox
