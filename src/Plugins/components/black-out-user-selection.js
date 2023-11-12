import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { USER_OPTIONS } from 'Plugins/constants';
import Typography from '@mui/material/Typography';
import { intersection, not } from 'utils/array';

export default function UserBlackoutList({
  blackedUsers,
  setBlackedUsers,
  unblackedUsers,
  setUnblackedUsers,
  currentUser,
  isBlacked,
  parentUnblackedUsers
}) {
  const [checked, setChecked] = React.useState([]);

  const leftChecked = intersection(checked, blackedUsers);
  const rightChecked = intersection(checked, unblackedUsers);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      // check if node is blacked by someone already and selected value is in unblacked user
      if (isBlacked && parentUnblackedUsers.indexOf(value) > -1) {
        return false;
      }
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setUnblackedUsers(not(USER_OPTIONS, [currentUser]));
    setBlackedUsers([]);
  };

  const handleCheckedRight = () => {
    setUnblackedUsers(unblackedUsers.concat(leftChecked).sort());
    setBlackedUsers(not(blackedUsers, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setBlackedUsers(blackedUsers.concat(rightChecked).sort());
    setUnblackedUsers(not(unblackedUsers, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setBlackedUsers(not(USER_OPTIONS, [currentUser]).sort());
    setUnblackedUsers([currentUser]);
  };

  const customList = (items, blacked) => (
    <Paper sx={{ width: 200, height: 300, overflow: 'auto' }}>
      <Typography variant={`caption`}>
        {blacked
          ? `The following users are Blacked out and can't change the text.`
          : `The following users are Unblacked out and can change the text.`}
      </Typography>
      <List dense component="div" role="list">
        {not(items, [currentUser]).map((value, index) => {
          const labelId = `transfer-list-item-${value}-label`;

          return (
            <ListItem
              key={`black-user-${index}`}
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
      <Grid item>{customList(blackedUsers, true)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={blackedUsers.length === 0}
            aria-label="Unblack All"
          >
            ≫
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="Unblack User"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="Black out User"
          >
            &lt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={unblackedUsers.length === 0}
            aria-label="Black out All"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(unblackedUsers)}</Grid>
    </Grid>
  );
}
