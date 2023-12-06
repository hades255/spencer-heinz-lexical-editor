import * as React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { USER_OPTIONS } from 'Plugins/constants';
import Typography from '@mui/material/Typography';
import { intersection, not } from 'utils/array';

export default function UserLockList({
  lockedUsers,
  setLockedUsers,
  unlockedUsers,
  setUnlockedUsers,
  currentUser,
  isLocked,
  parentUnlockedUsers
}) {
  const [checked, setChecked] = React.useState([]);

  const leftChecked = intersection(checked, lockedUsers);
  const rightChecked = intersection(checked, unlockedUsers);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      // check if node is locked by someone already and selected value is in unlocked user
      if (isLocked && parentUnlockedUsers.indexOf(value) > -1) {
        return false;
      }
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setUnlockedUsers(not(USER_OPTIONS, [currentUser]));
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
    setLockedUsers(not(USER_OPTIONS, [currentUser]).sort());
    setUnlockedUsers([currentUser]);
  };

  const customList = (items, locked) => (
    <Paper sx={{ width: 200, height: 300, overflow: 'auto' }}>
      <Typography variant={`caption`}>
        {locked ? `The following users are LOCKED and can't change the text.` : `The following users are UNLOCKED and can change the text.`}
      </Typography>
      <List dense component="div" role="list">
        {not(items, [currentUser]).map((value, index) => {
          const labelId = `transfer-list-item-${value}-label`;

          return (
            <ListItem
              key={`lock-user-${index}`}
              role="listitem"
              button
              onClick={handleToggle(value)}
              sx={{ backgroundColor: checked.indexOf(value) !== -1 ? `rgba(30,169,169, 0.2)` : `white` }}
            >
              {/* <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId
                  }}
                />
              </ListItemIcon> */}
              <ListItemText id={labelId} primary={`${value}`} />
            </ListItem>
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
  lockedUsers: PropTypes.any,
  setLockedUsers: PropTypes.any,
  unlockedUsers: PropTypes.any,
  setUnlockedUsers: PropTypes.any,
  currentUser: PropTypes.any,
  isLocked: PropTypes.any,
  parentUnlockedUsers: PropTypes.any
};
