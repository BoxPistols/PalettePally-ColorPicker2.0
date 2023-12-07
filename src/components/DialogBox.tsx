import React from 'react'
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material'

type DialogBoxProps = {
  showDialog: boolean
  closeDialog: () => void
  dialogContent: string
  downloadJSON: (data: any) => void
}

function DialogBox({
  showDialog,
  closeDialog,
  dialogContent,
  downloadJSON,
}: DialogBoxProps) {
  return (
    <Dialog open={showDialog} onClose={closeDialog}>
      <DialogContent
        sx={{
          minWidth: '60vw',
        }}
      >
        <pre>{dialogContent}</pre>
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
