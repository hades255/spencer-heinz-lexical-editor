import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, ClickAwayListener, Grow, IconButton, Paper, Popper, Typography } from '@mui/material';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import './pulse.css';

export default function CheckClipboardPermission() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const timerCallback = useCallback(() => {
    (async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' });
        localStorage.setItem('clipboard', permissionStatus.state);
        if (permissionStatus.state === 'granted') {
          setShow(false);
          return;
        }
        setShow(true);
      } catch (error) {
        console.error('Error checking clipboard permission:', error);
      }
    })();
  }, []);

  const checkFirstTime = useCallback(() => {
    (async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' });
        localStorage.setItem('clipboard', permissionStatus.state);
        if (permissionStatus.state === 'granted') {
          setShow(false);
          return;
        }
        setShow(true);
        dispatch(
          openSnackbar({
            open: true,
            message: 'You have to set clipboard permission to copy/paste contents from editor.',
            variant: 'alert',
            alert: {
              color: 'info'
            }
          })
        );
      } catch (error) {
        console.error('Error checking clipboard permission:', error);
      }
    })();
  }, []);

  useEffect(() => {
    checkFirstTime();
    // timerCallback();
    setInterval(() => {
      timerCallback();
    }, 1000);
  }, [timerCallback, checkFirstTime]);

  const handleOpen = useCallback(() => setOpen((prev) => !prev), []);

  const handleClose = useCallback((event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }, []);

  const handleGoHelp = useCallback(() => window.open('/faq', '_blank'), []);

  return (
    show && (
      <>
        <IconButton
          style={{
            position: 'fixed',
            top: 150,
            right: 20,
            zIndex: 9999,
            width: 30,
            height: 30,
            border: '2px solid orange',
            borderRadius: 10,
            animation: 'pulse 1s infinite'
          }}
          onClick={handleOpen}
          ref={anchorRef}
        >
          <WarningAmberIcon color="warning" />
        </IconButton>
        <Popper
          sx={{
            zIndex: 1202
          }}
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: 'center center'
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <Box sx={{ width: 200, p: 3, bgcolor: '#efc' }}>
                    <Typography>Set permission to clipboard on browser to copy/paste text on editor</Typography>
                    <Typography onClick={handleGoHelp} color={'primary'} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                      How to
                    </Typography>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    )
  );

  // return (
  //   <Dialog
  //     open={open}
  //     onClose={(r) => {
  //       console.log(r);
  //     }}
  //     keepMounted
  //     TransitionComponent={PopupTransition}
  //     maxWidth="xs"
  //     aria-labelledby="column-delete-title"
  //     aria-describedby="column-delete-description"
  //   >
  //     <DialogContent sx={{ mt: 2, my: 1 }}>
  //       <Stack alignItems="center" spacing={3.5}>
  //         <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
  //           <WarningOutlined />
  //         </Avatar>
  //         <Stack spacing={2}>
  //           <Typography variant="h4" align="center">
  //             You have to set Clipboard Permission to access to editor. Please check again.
  //           </Typography>
  //         </Stack>

  //         <Stack direction="row" spacing={2} sx={{ width: 1 }} justifyContent={'center'}>
  //           <Button type="submit" color="primary" variant="outlined" autoFocus onClick={handleGoBack}>
  //             Go back
  //           </Button>
  //         </Stack>
  //       </Stack>
  //     </DialogContent>
  //   </Dialog>
  // );
}
