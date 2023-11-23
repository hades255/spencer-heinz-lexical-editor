import * as React from 'react';
import PropType from 'prop-types';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { getUserIds } from 'lexical-editor/plugins/toolbarPlugin';
import { intersection, not } from 'utils/array';
import { ListItemButton } from '@mui/material';

export default function UserLockList({ lockedUsers, setLockedUsers, unlockedUsers, setUnlockedUsers, currentUser, users }) {
  const [checked, setChecked] = React.useState([]);
  const team = users.find((item) => item._id === currentUser)?.team;

  const leftChecked = intersection(checked, lockedUsers);
  const rightChecked = intersection(checked, unlockedUsers);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      // // check if node is locked by someone already and selected value is in unlocked user
      // if (isLocked && parentUnlockedUsers.indexOf(value) > -1) {
      //   return false;
      // }
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setUnlockedUsers(not(getUserIds(users), [currentUser]));
    setLockedUsers([]);
  };

  const handleCheckedRight = () => {
    setUnlockedUsers(unlockedUsers.concat(leftChecked).sort());
    setLockedUsers(not(lockedUsers, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLockedUsers(lockedUsers.concat(rightChecked).sort());
    setUnlockedUsers(not(unlockedUsers, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLockedUsers(not(getUserIds(users), [currentUser]).sort());
    setUnlockedUsers([currentUser]);
  };

  const customList = (items, locked) => (
    <Paper sx={{ width: 200, height: 300, overflow: 'auto' }}>
      <Typography variant={`caption`}>
        {locked ? `The following users are LOCKED and can't change the text.` : `The following users are UNLOCKED and can change the text.`}
      </Typography>
      <List dense component="div" role="list">
        {users
          .filter((item) => not(items, [currentUser]).includes(item._id))
          .map((value, index) => {
            const labelId = `transfer-list-item-${value._id}-label`;

            return (
              <ListItemButton
                key={`lock-user-${index}`}
                role="listitem"
                onClick={handleToggle(value._id)}
                sx={{ backgroundColor: checked.indexOf(value._id) !== -1 ? `rgba(30,169,169, 0.2)` : `white` }}
              >
                <ListItemText id={labelId} primary={`${value.name} ${value?.team !== team ? ` (TL ${value?.team})` : ''}`} />
              </ListItemButton>
            );
          })}
      </List>
    </Paper>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>{customList(lockedUsers, true)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={lockedUsers.length === 0}
            aria-label="Unlock All"
          >
            ≫
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="Unlock User"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="Lock User"
          >
            &lt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={unlockedUsers.length === 0}
            aria-label="Lock All"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(unlockedUsers)}</Grid>
    </Grid>
  );
}

UserLockList.propTypes = {
  lockedUsers: PropType.any,
  setLockedUsers: PropType.any,
  unlockedUsers: PropType.any,
  setUnlockedUsers: PropType.any,
  currentUser: PropType.any,
  users: PropType.any
};
