import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { List, ListItemButton } from '@mui/material';

// project imports
import { useDispatch } from 'store';

// assets
import CustomCell from 'components/customers/CustomCell';

function UserList({ search, uniqueId, users }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(users);

  // useEffect(() => {
  //   dispatch(getUsers(uniqueId));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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
      {data.map((user, key) => (
        <ListItemButton sx={{ pl: 1 }} key={key}>
          <CustomCell user={user} />
        </ListItemButton>
      ))}
    </List>
  );
}

UserList.propTypes = {
  search: PropTypes.string,
  users: PropTypes.any
};

export default UserList;
