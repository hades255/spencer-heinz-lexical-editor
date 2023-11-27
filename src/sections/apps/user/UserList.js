import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

// material-ui
import { List, ListItemButton, Popover, Stack, Typography } from '@mui/material';

// assets
import CustomCell from 'components/customers/CustomCell';
import { MobileOutlined, PhoneOutlined } from '@ant-design/icons';
import { PatternFormat } from 'react-number-format';

function UserList({ search, users }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (search) {
      const results = users.filter((row) => {
        let matches = true;

        const properties = ['name'];
        let containsQuery = false;

        properties.forEach((property) => {
          if (row[property].toString().toLowerCase().includes(search.toString().toLowerCase())) {
            containsQuery = true;
          }
        });

        if (!containsQuery) {
          matches = false;
        }
        return matches;
      });

      setData(results);
    } else {
      setData(users);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, users]);

  return (
    <List component="nav">
      {data.map((user, key) => (
        <UserListItem user={user} key={key} />
      ))}
    </List>
  );
}

UserList.propTypes = {
  search: PropTypes.string,
  users: PropTypes.any
};

export default UserList;

const UserListItem = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <ListItemButton sx={{ p: 0, mt: 1, pl: 1 }} onClick={handleClick}>
        <CustomCell user={user} />
      </ListItemButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
      >
        <Stack sx={{ minWidth: 150, p: 1 }} spacing={0}>
          <Typography variant="" color="textSecondary">
            <MobileOutlined style={{ borderRadius: '10px' }} />
            <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.mobilePhone} />
          </Typography>
          <Typography variant="" color="textSecondary">
            <PhoneOutlined />
            <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.workPhone} />
          </Typography>
        </Stack>
      </Popover>
    </>
  );
};

UserListItem.propTypes = {
  user: PropTypes.any
};
