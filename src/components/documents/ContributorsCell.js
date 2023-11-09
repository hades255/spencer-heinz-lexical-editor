import PropTypes from 'prop-types';
import { AvatarGroup } from '@mui/material';
import UserAvatar from 'sections/apps/user/UserAvatar';

const ContributorsCell = ({ row }) => {
  const contributors = row.values.contributors ?? [];

  return (
    <AvatarGroup max={5}>
      {contributors.map((item, key) => (
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
ContributorsCell.propTypes = {
  row: PropTypes.object
};

export default ContributorsCell;

export const InvitesCell = ({ row }) => {
  const invites = row.values.invites ?? [];

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
  row: PropTypes.object
};