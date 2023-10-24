import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, List, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';

// third-party
import { Chance } from 'chance';

// project imports
import UserAvatar from './UserAvatar';
import Dot from 'components/@extended/Dot';
import { useDispatch, useSelector } from 'store';
import { getUsers } from 'store/reducers/chat';
import { v4 as uuidv4 } from 'uuid';

// assets
import { CheckOutlined } from '@ant-design/icons';

const chance = new Chance();

function UserList({ setUser, search, uniqueId }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const { users } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getUsers(uniqueId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(users);
    setData(users);
  }, [users]);

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
  }, [search]);

  return (
    <List component="nav">
      {data.map((user) => (
        <Fragment key={uuidv4()}>
          <ListItemButton
            sx={{ pl: 1 }}
            onClick={() => {
              setUser(user);
            }}
          >
            <ListItemAvatar>
              <UserAvatar user={user} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography
                    variant="h5"
                    color="inherit"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.name}
                  </Typography>
                </Stack>
              }
            // secondary={
            //   <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            //     <Typography
            //       variant="caption"
            //       color="textSecondary"
            //       sx={{
            //         overflow: 'hidden',
            //         textOverflow: 'ellipsis',
            //         whiteSpace: 'nowrap'
            //       }}
            //     >
            //       {user.status}
            //     </Typography>
            //     {user.unReadChatCount ? (
            //       <Dot color="primary" />
            //     ) : (
            //       // chance.bool() - use for last send msg was read or unread
            //       <CheckOutlined style={{ color: chance.bool() ? theme.palette.grey[400] : theme.palette.primary.main }} />
            //     )}
            //   </Stack>
            // }
            />
          </ListItemButton>
          <Divider />
        </Fragment>
      ))}
    </List>
  );
}

UserList.propTypes = {
  setUser: PropTypes.func,
  search: PropTypes.string
};

export default UserList;
