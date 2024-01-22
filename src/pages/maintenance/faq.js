import { useState } from 'react';
// material-ui
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, IconButton, InputBase, Paper, Stack, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import img1 from 'assets/images/faq/clipboard.png';

function FAQ() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Grid alignItems="center" justifyContent="center">
        <Grid item xs={12} width={'100%'}>
          <Box sx={{ height: { xs: 150, sm: 210 }, bgcolor: '#aaa' }} width={'100%'}>
            <Stack width={'100%'} height={'100%'} direction={'row'} justifyContent={'center'} alignItems={'center'}>
              <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: { xs: '80%', sm: 400 } }}>
                <InputBase
                  sx={{ ml: 2, p: 2, flex: 1 }}
                  placeholder="How can we help you today?"
                  inputProps={{ 'aria-label': 'How can we help you today?' }}
                />
                <IconButton type="button" sx={{ mx: 2, px: '10px' }} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ my: 9 }}>
          <Stack spacing={1} justifyContent="center" alignItems="center" sx={{ mt: -2 }}>
            <Box width={'90%'}>
              <Typography align="center" variant="h1" my={2}>
                Frequently Asked Questions
              </Typography>
              <Typography align="center" color="textSecondary">
                Need some help or got a burning question that you need answered pronto? Just click on one of the sections below to find the
                answer...
              </Typography>
            </Box>
          </Stack>
        </Grid>
        <Stack direction={'row'} justifyContent={'center'}>
          <Box width={{ xs: '90%', sm: '80%' }}>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} sx={{ border: 0, bgcolor: 'transparent' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                sx={{ bgcolor: 'transparent' }}
              >
                <Typography fontSize={27} variant="subtitle2">
                  Unable to copy and paste text while editing a document
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  To copy and paste text from within the editor window, the browser permissions must be set to {`‘`}Allow{`’`} for the
                  website.
                </Typography>
                <Typography>
                  Example for Microsoft Edge (other browsers will follow a similar process): Open Browser Settings -{`>`} Cookies and site
                  permissions -{`>`} Clipboard -{`>`} Allow -{`>`} Add -{`>`} Enter the web address for this site.
                </Typography>
                <Stack direction={'row'} justifyContent={'center'} sx={{ p: 3 }}>
                  <img src={img1} alt="mantis" style={{ width: '100%', maxWidth: 600 }} />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Stack>
      </Grid>
    </>
  );
}

export default FAQ;
