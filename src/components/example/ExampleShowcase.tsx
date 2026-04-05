import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Chip, Alert, AlertTitle,
  TextField, Select, MenuItem, Checkbox, Radio, RadioGroup, FormControlLabel,
  FormControl, FormLabel, Switch, Slider, LinearProgress, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Badge, Tooltip,
  Accordion, AccordionSummary, AccordionDetails, Breadcrumbs, Link,
} from '@mui/material';

export function ExampleShowcase() {
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('a');
  const [slider, setSlider] = useState(50);
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Typography */}
      <Section title='Typography'>
        <Typography variant='h4'>Heading 4</Typography>
        <Typography variant='h5'>Heading 5</Typography>
        <Typography variant='h6'>Heading 6</Typography>
        <Typography variant='body1'>Body 1 — the quick brown fox jumps over the lazy dog.</Typography>
        <Typography variant='body2' color='text.secondary'>Body 2 — secondary text color</Typography>
        <Typography variant='caption' color='text.disabled'>Caption — disabled text</Typography>
      </Section>

      {/* Buttons — Contained */}
      <Section title='Buttons (Contained)'>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant='contained' color='primary'>Primary</Button>
          <Button variant='contained' color='secondary'>Secondary</Button>
          <Button variant='contained' color='success'>Success</Button>
          <Button variant='contained' color='warning'>Warning</Button>
          <Button variant='contained' color='info'>Info</Button>
          <Button variant='contained' color='error'>Error</Button>
          <Button variant='contained' disabled>Disabled</Button>
        </Box>
      </Section>

      {/* Buttons — Outlined */}
      <Section title='Buttons (Outlined)'>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant='outlined' color='primary'>Primary</Button>
          <Button variant='outlined' color='secondary'>Secondary</Button>
          <Button variant='outlined' color='success'>Success</Button>
          <Button variant='outlined' color='warning'>Warning</Button>
          <Button variant='outlined' color='info'>Info</Button>
          <Button variant='outlined' color='error'>Error</Button>
        </Box>
      </Section>

      {/* Buttons — Text */}
      <Section title='Buttons (Text)'>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant='text' color='primary'>Primary</Button>
          <Button variant='text' color='secondary'>Secondary</Button>
          <Button variant='text' color='success'>Success</Button>
          <Button variant='text' color='warning'>Warning</Button>
          <Button variant='text' color='info'>Info</Button>
          <Button variant='text' color='error'>Error</Button>
          <IconButton color='primary'><IconBell /></IconButton>
          <IconButton color='error'><IconHeart /></IconButton>
        </Box>
      </Section>

      {/* Chips + Badges */}
      <Section title='Chips & Badges'>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label='Default' />
          <Chip label='Primary' color='primary' />
          <Chip label='Secondary' color='secondary' />
          <Chip label='Success' color='success' />
          <Chip label='Warning' color='warning' />
          <Chip label='Info' color='info' />
          <Chip label='Error' color='error' />
          <Chip label='Outlined' variant='outlined' color='primary' />
          <Badge badgeContent={4} color='primary'>
            <IconBell />
          </Badge>
          <Badge badgeContent={99} color='error'>
            <IconHeart />
          </Badge>
        </Box>
      </Section>

      {/* Alerts */}
      <Section title='Alerts'>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Alert severity='info'>
            <AlertTitle>Info</AlertTitle>
            This is an informational message.
          </Alert>
          <Alert severity='success'>
            <AlertTitle>Success</AlertTitle>
            Operation completed successfully.
          </Alert>
          <Alert severity='warning'>
            <AlertTitle>Warning</AlertTitle>
            Please review before proceeding.
          </Alert>
          <Alert severity='error'>
            <AlertTitle>Error</AlertTitle>
            Something went wrong.
          </Alert>
        </Box>
      </Section>

      {/* Form Controls */}
      <Section title='Form Controls'>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          <TextField label='Text Input' defaultValue='Hello world' size='small' />
          <TextField label='Error' error helperText='This field has an error' size='small' />
          <FormControl size='small'>
            <FormLabel>Select</FormLabel>
            <Select value='b' size='small'>
              <MenuItem value='a'>Option A</MenuItem>
              <MenuItem value='b'>Option B</MenuItem>
              <MenuItem value='c'>Option C</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Radio</FormLabel>
            <RadioGroup row value={radio} onChange={e => setRadio(e.target.value)}>
              <FormControlLabel value='a' control={<Radio />} label='A' />
              <FormControlLabel value='b' control={<Radio />} label='B' />
            </RadioGroup>
          </FormControl>
          <Box>
            <FormControlLabel control={<Checkbox checked={checked} onChange={e => setChecked(e.target.checked)} />} label='Checkbox' />
            <FormControlLabel control={<Switch checked={switchOn} onChange={e => setSwitchOn(e.target.checked)} />} label='Switch' />
          </Box>
          <Box>
            <FormLabel>Slider: {slider}</FormLabel>
            <Slider value={slider} onChange={(_, v) => setSlider(v as number)} />
          </Box>
        </Box>
      </Section>

      {/* Progress */}
      <Section title='Progress'>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress value={65} variant='determinate' sx={{ mb: 1 }} />
            <LinearProgress value={40} variant='determinate' color='secondary' />
          </Box>
          <CircularProgress color='primary' />
          <CircularProgress color='secondary' />
        </Box>
      </Section>

      {/* Tabs */}
      <Section title='Tabs'>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label='Overview' />
          <Tab label='Details' />
          <Tab label='Activity' />
          <Tab label='Settings' />
        </Tabs>
        <Box sx={{ p: 2, color: 'text.secondary' }}>
          Tab {tab + 1} content
        </Box>
      </Section>

      {/* Table */}
      <Section title='Table'>
        <Paper variant='outlined' sx={{ overflow: 'hidden' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align='right'>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Invoice #1024', status: 'Paid', amount: '¥12,000' },
                { name: 'Invoice #1025', status: 'Pending', amount: '¥8,500' },
                { name: 'Invoice #1026', status: 'Overdue', amount: '¥15,200' },
              ].map(row => (
                <TableRow key={row.name} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size='small'
                      color={row.status === 'Paid' ? 'primary' : row.status === 'Pending' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align='right'>{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Section>

      {/* Card */}
      <Section title='Card'>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
          <Card>
            <CardContent>
              <Typography variant='h6'>Card Title</Typography>
              <Typography variant='body2' color='text.secondary'>
                Card description goes here. Supports multiline content.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size='small' color='primary'>Action</Button>
              <Button size='small' color='secondary'>Cancel</Button>
            </CardActions>
          </Card>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6'>Outlined Card</Typography>
              <Typography variant='body2' color='text.secondary'>With outlined variant.</Typography>
            </CardContent>
          </Card>
        </Box>
      </Section>

      {/* List */}
      <Section title='List'>
        <Paper variant='outlined'>
          <List>
            {['Alice', 'Bob', 'Charlie'].map(name => (
              <ListItem key={name}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={name} secondary={`${name.toLowerCase()}@example.com`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Section>

      {/* Accordion */}
      <Section title='Accordion'>
        <Accordion>
          <AccordionSummary>
            <Typography>Section 1</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2' color='text.secondary'>
              Expandable content for section 1.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>Section 2</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2' color='text.secondary'>
              Expandable content for section 2.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Section>

      {/* Breadcrumbs */}
      <Section title='Breadcrumbs'>
        <Breadcrumbs>
          <Link underline='hover' color='inherit'>Home</Link>
          <Link underline='hover' color='inherit'>Catalog</Link>
          <Typography color='text.primary'>Current</Typography>
        </Breadcrumbs>
      </Section>

      {/* Dialog */}
      <Section title='Dialog'>
        <Button variant='contained' onClick={() => setDialogOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogContent>
            <Typography>This dialog uses the generated theme colors.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='contained' onClick={() => setDialogOpen(false)}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </Section>

      {/* Divider */}
      <Section title='Divider & Tooltip'>
        <Box>
          <Tooltip title='Tooltip text here' arrow>
            <Button variant='outlined'>Hover me</Button>
          </Tooltip>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Divider textAlign='left'>OR</Divider>
      </Section>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant='overline'
        sx={{
          display: 'block',
          fontWeight: 700,
          letterSpacing: 1,
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

const IconBell = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
    <path d='M13.73 21a2 2 0 0 1-3.46 0' />
  </svg>
);

const IconHeart = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
  </svg>
);
