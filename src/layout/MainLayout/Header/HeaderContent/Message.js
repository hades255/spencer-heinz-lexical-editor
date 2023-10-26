import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { ThemeMode } from 'config';

// assets
import { MailOutlined, CloseOutlined } from '@ant-design/icons';
import { useSelector } from 'store';
import moment from 'moment';
import BackgroundLetterAvatar from 'components/@extended/BackgroundLetterAvatar';
import { MESSAGE_TYPES } from 'config/constants';

// sx styles
const avatarSX = {
  width: 48,
  height: 48
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - MESSAGES ||============================== //

const Message = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const messages = useSelector((state) => state.message.list);

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleGoList = useCallback(
    (e) => {
      setOpen(false);
      e.preventDefault();
      navigate('/message');
    },
    [navigate]
  );

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <MailOutlined />
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{
          maxHeight: 'calc(100vh - 250px)',
          overflow: 'auto'
        }}
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -60 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Message"
                  elevation={0}
                  border={true}
                  content={false}
                  secondary={
                    <IconButton size="small" onClick={handleToggle}>
                      <CloseOutlined />
                    </IconButton>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      maxHeight: '400px',
                      overflowY: 'scroll',
                      '& .MuiListItemButton-root': {
                        py: 1.5,
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {messages.map((item, key) => (
                      <MessageItem key={key} message={item} navigate={navigate} setOpen={setOpen} />
                    ))}
                  </List>
                  <ListItemButton sx={{ textAlign: 'center' }} onClick={handleGoList}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" color="primary">
                          View All
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Message;

export const MessageItem = ({ message, navigate, setOpen = null }) => {
  const handleClick = useCallback(
    (e) => {
      if (message.type === MESSAGE_TYPES.DOCUMENT_INVITE_RESOLVE) {
        navigate('/message/' + message._id);
      }
      if (setOpen) setOpen(false);
    },
    [message, navigate]
  );
  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemAvatar>
          <BackgroundLetterAvatar name={message.from.name} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <>
              <Typography variant="h6">
                <Typography component="span" variant="subtitle1">
                  {message.from.name}
                </Typography>
                {'  '}
                <Typography component="span" variant="subtitle2">
                  {message.from.email}
                </Typography>
              </Typography>
              <Typography variant="h6">
                {message.data.map((text, key) => (
                  <span key={key}>
                    {text.variant ? (
                      <Typography component="span" variant={text.variant}>
                        {text.text}
                      </Typography>
                    ) : (
                      text.text
                    )}
                  </span>
                ))}
              </Typography>
            </>
          }
          secondary={moment(message.createdAt).fromNow()}
        />
        {message.createdAt !== message.updatedAt && (
          <ListItemSecondaryAction>
            <Typography variant="caption" noWrap>
              {moment(message.createdAt).format('h:mm A')}
            </Typography>
          </ListItemSecondaryAction>
        )}
      </ListItemButton>
      <Divider />
    </>
  );
};

MessageItem.propTypes = {
  message: PropTypes.object,
  navigate: PropTypes.any,
  setOpen: PropTypes.any
};
