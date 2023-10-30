import { Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import UserAvatar from 'sections/apps/user/UserAvatar';

const CustomCell = ({ user, status = false }) => {
  if (!user) return <></>;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <UserAvatar
        user={{
          online_status:
            status && user && (user.online_status || user.status)
              ? user.online_status
                ? user.online_status
                : user.status === 'active'
                ? 'offline'
                : 'do_not_disturb'
              : 'none',
          avatar: user.avatar,
          name: user.name
        }}
      />
      <Stack spacing={0}>
        <Typography variant="subtitle1">{user.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {user.email}
        </Typography>
      </Stack>
    </Stack>
  );
};

CustomCell.propTypes = {
  user: PropTypes.any,
  status: PropTypes.bool
};

export default CustomCell;
