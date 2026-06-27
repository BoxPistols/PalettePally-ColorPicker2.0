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
import { t } from '@/lib/i18n';

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
      <Section title={t.exampleShowcase.sectionTypography}>
        <Typography variant='h4'>{t.exampleShowcase.heading4}</Typography>
        <Typography variant='h5'>{t.exampleShowcase.heading5}</Typography>
        <Typography variant='h6'>{t.exampleShowcase.heading6}</Typography>
        <Typography variant='body1'>{t.exampleShowcase.body1Text}</Typography>
        <Typography variant='body2' color='text.secondary'>{t.exampleShowcase.body2Text}</Typography>
        <Typography variant='caption' color='text.disabled'>{t.exampleShowcase.captionText}</Typography>
      </Section>

      {/* Buttons — Contained */}
      <Section title={t.exampleShowcase.sectionButtonsContained}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant='contained' color='primary'>{t.exampleShowcase.primary}</Button>
          <Button variant='contained' color='secondary'>{t.exampleShowcase.secondary}</Button>
          <Button variant='contained' color='success'>{t.exampleShowcase.success}</Button>
          <Button variant='contained' color='warning'>{t.exampleShowcase.warning}</Button>
          <Button variant='contained' color='info'>{t.exampleShowcase.info}</Button>
          <Button variant='contained' color='error'>{t.exampleShowcase.error}</Button>
          <Button variant='contained' disabled>{t.exampleShowcase.disabled}</Button>
        </Box>
      </Section>

      {/* Buttons — Outlined */}
      <Section title={t.exampleShowcase.sectionButtonsOutlined}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant='outlined' color='primary'>{t.exampleShowcase.primary}</Button>
          <Button variant='outlined' color='secondary'>{t.exampleShowcase.secondary}</Button>
          <Button variant='outlined' color='success'>{t.exampleShowcase.success}</Button>
          <Button variant='outlined' color='warning'>{t.exampleShowcase.warning}</Button>
          <Button variant='outlined' color='info'>{t.exampleShowcase.info}</Button>
          <Button variant='outlined' color='error'>{t.exampleShowcase.error}</Button>
        </Box>
      </Section>

      {/* Buttons — Text */}
      <Section title={t.exampleShowcase.sectionButtonsText}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant='text' color='primary'>{t.exampleShowcase.primary}</Button>
          <Button variant='text' color='secondary'>{t.exampleShowcase.secondary}</Button>
          <Button variant='text' color='success'>{t.exampleShowcase.success}</Button>
          <Button variant='text' color='warning'>{t.exampleShowcase.warning}</Button>
          <Button variant='text' color='info'>{t.exampleShowcase.info}</Button>
          <Button variant='text' color='error'>{t.exampleShowcase.error}</Button>
          <IconButton color='primary'><IconBell /></IconButton>
          <IconButton color='error'><IconHeart /></IconButton>
        </Box>
      </Section>

      {/* Chips + Badges */}
      <Section title={t.exampleShowcase.sectionChipsBadges}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label={t.exampleShowcase.default} />
          <Chip label={t.exampleShowcase.primary} color='primary' />
          <Chip label={t.exampleShowcase.secondary} color='secondary' />
          <Chip label={t.exampleShowcase.success} color='success' />
          <Chip label={t.exampleShowcase.warning} color='warning' />
          <Chip label={t.exampleShowcase.info} color='info' />
          <Chip label={t.exampleShowcase.error} color='error' />
          <Chip label={t.exampleShowcase.outlined} variant='outlined' color='primary' />
          <Badge badgeContent={4} color='primary'>
            <IconBell />
          </Badge>
          <Badge badgeContent={99} color='error'>
            <IconHeart />
          </Badge>
        </Box>
      </Section>

      {/* Alerts */}
      <Section title={t.exampleShowcase.sectionAlerts}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Alert severity='info'>
            <AlertTitle>{t.exampleShowcase.info}</AlertTitle>
            {t.exampleShowcase.alertInfoBody}
          </Alert>
          <Alert severity='success'>
            <AlertTitle>{t.exampleShowcase.success}</AlertTitle>
            {t.exampleShowcase.alertSuccessBody}
          </Alert>
          <Alert severity='warning'>
            <AlertTitle>{t.exampleShowcase.warning}</AlertTitle>
            {t.exampleShowcase.alertWarningBody}
          </Alert>
          <Alert severity='error'>
            <AlertTitle>{t.exampleShowcase.error}</AlertTitle>
            {t.exampleShowcase.alertErrorBody}
          </Alert>
        </Box>
      </Section>

      {/* Form Controls */}
      <Section title={t.exampleShowcase.sectionFormControls}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          <TextField label={t.exampleShowcase.textInputLabel} defaultValue='Hello world' size='small' />
          <TextField label={t.exampleShowcase.error} error helperText={t.exampleShowcase.errorHelperText} size='small' />
          <FormControl size='small'>
            <FormLabel>{t.exampleShowcase.selectLabel}</FormLabel>
            <Select value='b' size='small'>
              <MenuItem value='a'>{t.exampleShowcase.optionA}</MenuItem>
              <MenuItem value='b'>{t.exampleShowcase.optionB}</MenuItem>
              <MenuItem value='c'>{t.exampleShowcase.optionC}</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>{t.exampleShowcase.radioLabel}</FormLabel>
            <RadioGroup row value={radio} onChange={e => setRadio(e.target.value)}>
              <FormControlLabel value='a' control={<Radio />} label={t.exampleShowcase.radioOptionA} />
              <FormControlLabel value='b' control={<Radio />} label={t.exampleShowcase.radioOptionB} />
            </RadioGroup>
          </FormControl>
          <Box>
            <FormControlLabel control={<Checkbox checked={checked} onChange={e => setChecked(e.target.checked)} />} label={t.exampleShowcase.checkboxLabel} />
            <FormControlLabel control={<Switch checked={switchOn} onChange={e => setSwitchOn(e.target.checked)} />} label={t.exampleShowcase.switchLabel} />
          </Box>
          <Box>
            <FormLabel>{t.exampleShowcase.sliderLabel(slider)}</FormLabel>
            <Slider value={slider} onChange={(_, v) => setSlider(v as number)} />
          </Box>
        </Box>
      </Section>

      {/* Progress */}
      <Section title={t.exampleShowcase.sectionProgress}>
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
      <Section title={t.exampleShowcase.sectionTabs}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t.exampleShowcase.tabOverview} />
          <Tab label={t.exampleShowcase.tabDetails} />
          <Tab label={t.exampleShowcase.tabActivity} />
          <Tab label={t.exampleShowcase.tabSettings} />
        </Tabs>
        <Box sx={{ p: 2, color: 'text.secondary' }}>
          {t.exampleShowcase.tabContent(tab + 1)}
        </Box>
      </Section>

      {/* Table */}
      <Section title={t.exampleShowcase.sectionTable}>
        <Paper variant='outlined' sx={{ overflow: 'hidden' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>{t.exampleShowcase.tableName}</TableCell>
                <TableCell>{t.exampleShowcase.tableStatus}</TableCell>
                <TableCell align='right'>{t.exampleShowcase.tableAmount}</TableCell>
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
      <Section title={t.exampleShowcase.sectionCard}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
          <Card>
            <CardContent>
              <Typography variant='h6'>{t.exampleShowcase.cardTitle}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {t.exampleShowcase.cardDescription}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size='small' color='primary'>{t.exampleShowcase.cardActionLabel}</Button>
              <Button size='small' color='secondary'>{t.exampleShowcase.cancel}</Button>
            </CardActions>
          </Card>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6'>{t.exampleShowcase.outlinedCardTitle}</Typography>
              <Typography variant='body2' color='text.secondary'>{t.exampleShowcase.outlinedCardDescription}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Section>

      {/* List */}
      <Section title={t.exampleShowcase.sectionList}>
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
      <Section title={t.exampleShowcase.sectionAccordion}>
        <Accordion>
          <AccordionSummary>
            <Typography>{t.exampleShowcase.accordionSection1}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2' color='text.secondary'>
              {t.exampleShowcase.accordionContent1}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t.exampleShowcase.accordionSection2}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2' color='text.secondary'>
              {t.exampleShowcase.accordionContent2}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Section>

      {/* Breadcrumbs */}
      <Section title={t.exampleShowcase.sectionBreadcrumbs}>
        <Breadcrumbs>
          <Link underline='hover' color='inherit'>{t.exampleShowcase.breadcrumbHome}</Link>
          <Link underline='hover' color='inherit'>{t.exampleShowcase.breadcrumbCatalog}</Link>
          <Typography color='text.primary'>{t.exampleShowcase.breadcrumbCurrent}</Typography>
        </Breadcrumbs>
      </Section>

      {/* Dialog */}
      <Section title={t.exampleShowcase.sectionDialog}>
        <Button variant='contained' onClick={() => setDialogOpen(true)}>
          {t.exampleShowcase.openDialog}
        </Button>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>{t.exampleShowcase.dialogTitle}</DialogTitle>
          <DialogContent>
            <Typography>{t.exampleShowcase.dialogContent}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t.exampleShowcase.cancel}</Button>
            <Button variant='contained' onClick={() => setDialogOpen(false)}>{t.exampleShowcase.confirm}</Button>
          </DialogActions>
        </Dialog>
      </Section>

      {/* Divider */}
      <Section title={t.exampleShowcase.sectionDividerTooltip}>
        <Box>
          <Tooltip title={t.exampleShowcase.tooltipText} arrow>
            <Button variant='outlined'>{t.exampleShowcase.hoverMe}</Button>
          </Tooltip>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Divider textAlign='left'>{t.exampleShowcase.dividerOr}</Divider>
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
