import PropTypes from 'prop-types';
import { AvatarGroup } from '@mui/material';
import UserAvatar from 'sections/apps/user/UserAvatar';

export const InvitesCell = ({ row, user = null }) => {
  let invites = [];
  if (user) {
    let team = '';
    if (user._id === row.values.creator._id) team = row.values.team;
    else {
      for (let inv of row.values.invites) {
        if (inv._id === user._id) {
          team = inv.team;
          break;
        }
      }
    }
    invites = (team ? row.values.invites.filter((item) => item.team === team) : row.values.invites) ?? [];
  } else {
    invites = row.values.invites ?? [];
  }

  return (
    <AvatarGroup max={5}>
      {invites.map((item, key) => (
        <UserAvatar
          key={key}
          user={{
            online_status: 'none',
            avatar: item.avatar,
            name: item.name,
            email: item.email
          }}
        />
      ))}
    </AvatarGroup>
  );
};
InvitesCell.propTypes = {
  row: PropTypes.object,
  user: PropTypes.any
};
