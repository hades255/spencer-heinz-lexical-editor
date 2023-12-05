import { Stack, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import UserAvatar from 'sections/apps/user/UserAvatar';

const CustomCell = ({ user, status = false }) => {
  if (!user) return <></>;
  console.log(user)
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <UserAvatar
        user={{
          online_status: user.online_status || (status ? (user.status === 'active' ? 'offline' : 'do_not_disturb') : 'none'),
          avatar: user.avatar,
          name: user.name
        }}
      />
      <Stack spacing={0}>
        <Tooltip title={user.name}>
          <Typography variant="subtitle1">{user.name}</Typography>
        </Tooltip>
        <Tooltip title={user.email}>
          <Typography variant="caption" color="textSecondary">
            {user.email}
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

CustomCell.propTypes = {
  user: PropTypes.any,
  status: PropTypes.bool
};

export default CustomCell;
