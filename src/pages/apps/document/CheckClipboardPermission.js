import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// material-ui

import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
// assets
import { WarningOutlined } from '@ant-design/icons';

// let timer = null;

export default function CheckClipboardPermission() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const timerCallback = useCallback(() => {
    (async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' });
        if (permissionStatus.state === 'granted') {
          // Clipboard permission granted, you can now read from the clipboard
          setOpen(false);
          //   clearInterval(timer);
          return;
        }
        setOpen(true);
      } catch (error) {
        console.error('Error checking clipboard permission:', error);
      }
    })();
  }, []);

  useEffect(() => {
    timerCallback();
    setInterval(() => {
      timerCallback();
    }, 1000);
  }, [timerCallback]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Dialog
      open={open}
      onClose={(r) => {
        console.log(r);
      }}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <WarningOutlined />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              You have to set Clipboard Permission to access to editor. Please check again.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }} justifyContent={'center'}>
            <Button type="submit" color="primary" variant="outlined" autoFocus onClick={handleGoBack}>
              Go back
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
