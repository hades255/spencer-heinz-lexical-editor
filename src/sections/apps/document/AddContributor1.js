import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CustomCell from 'components/customers/CustomCell';
import { Stack, TextField } from '@mui/material';
import { StatusCell } from 'pages/apps/customer/list';
import { useAsyncDebounce } from 'react-table';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import AddNewInviteConfirmDlg from './AddNewInviteConfirmDlg';
import AddNewInviteDlg from './AddNewInviteDlg';
const filter = createFilterOptions();

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

const ListCell = ({ user, dbClick, dir }) => {
  return (
    <Stack
      direction={'row'}
      justifyContent={'space-between'}
      onDoubleClick={() => {
        dbClick(user.email, dir);
      }}
    >
      <CustomCell user={user} />
      <StatusCell value={user.status} />
    </Stack>
  );
};

ListCell.propTypes = {
  user: PropTypes.object,
  dbClick: PropTypes.func,
  dir: PropTypes.bool
};

export default function AddContributor({ users, value, onChange, exist = [], mine = false }) {
  const [checked, setChecked] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [openDlg, toggleOpenDlg] = useState(false);
  const [openCDlg, toggleOpenCDlg] = useState(false);

  const leftChecked = intersection(
    checked,
    users.filter((item) => !value.includes(item.email)).map((item) => item.email)
  );
  const rightChecked = intersection(checked, value);

  const handleToggle = (item) => () => {
    const currentIndex = checked.indexOf(item);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(item);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    onChange(union(value, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    onChange(not(value, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleDbClick = useCallback(
    (email, dir = true) => {
      if (dir) {
        onChange(union(value, [email]));
      } else {
        onChange(not(value, [email]));
      }
      setChecked(not(checked, [email]));
    },
    [value, checked, onChange]
  );

  const onSearch = useAsyncDebounce((value) => {
    setSearch(value.toLowerCase());
  }, 200);

  const handleCloseCDlg = (res = false) => {
    toggleOpenCDlg(false);
    toggleOpenDlg(res);
  };

  const handleCloseDlg = (email = '') => {
    toggleOpenDlg(false);
    if (email) onChange([...value, email]);
    setSearchVal('');
  };

  const customList = (title, items) => {
    const ids = items.map((item) => item.email).filter((item) => mine || !exist.includes(item));
    return (
      <Card>
        <CardHeader
          sx={{ px: 2, py: 1 }}
          avatar={
            <Checkbox
              onClick={handleToggleAll(ids)}
              checked={numberOfChecked(ids) === ids.length && ids.length !== 0}
              indeterminate={numberOfChecked(ids) !== ids.length && numberOfChecked(ids) !== 0}
              disabled={ids.length === 0}
              inputProps={{
                'aria-label': 'all items selected'
              }}
            />
          }
          title={title}
          subheader={`${numberOfChecked(ids)}/${ids.length} selected`}
        />
        <Divider />
        <List
          sx={{
            width: 280,
            height: '40vh',
            minHeight: 250,
            bgcolor: 'background.paper',
            overflow: 'auto'
          }}
          dense
          component="div"
          role="list"
        >
          {items.map((item, key) => {
            const labelId = `transfer-list-all-item-${item.email}-label`;

            return !mine && exist.includes(item.email) ? (
              <ListItem key={key} role="listitem">
                <ListItemIcon>
                  <Checkbox
                    disabled
                    checked={false}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      'aria-labelledby': labelId
                    }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={<ListCell user={item} dbClick={() => {}} dir={title === 'Choices'} />} />
              </ListItem>
            ) : (
              <ListItem key={key} role="listitem" onClick={handleToggle(item.email)} button>
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(item.email) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      'aria-labelledby': labelId
                    }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={<ListCell user={item} dbClick={handleDbClick} dir={title === 'Choices'} />} />
              </ListItem>
            );
          })}
        </List>
      </Card>
    );
  };

  return (
    <Stack sx={{ m: 1 }}>
      <SearchInput searchVal={searchVal} toggleOpenCDlg={toggleOpenCDlg} users={users} setSearchVal={setSearchVal} onSearch={onSearch} />
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item>
          {customList(
            'Choices',
            users
              .filter((item) => !value.includes(item.email) && item.email.includes(search))
              .sort((a, b) => (a.status > b.status ? 1 : a.status < b.status ? -1 : 0))
          )}
        </Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center">
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={users.filter((item) => !value.includes(item.email)).length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={value.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {customList(
            'Chosen',
            users
              .filter((item) => value.includes(item.email) && item.email.includes(search))
              .sort((a, b) => (a.status > b.status ? 1 : a.status < b.status ? -1 : 0))
          )}
        </Grid>
      </Grid>
      {openCDlg && <AddNewInviteConfirmDlg open={openCDlg} onClose={handleCloseCDlg} />}
      {openDlg && <AddNewInviteDlg open={openDlg} email={searchVal} onClose={handleCloseDlg} />}
    </Stack>
  );
}

AddContributor.propTypes = {
  users: PropTypes.any,
  value: PropTypes.any,
  exist: PropTypes.any,
  mine: PropTypes.bool,
  onChange: PropTypes.func
};

const SearchInput = ({ searchVal, toggleOpenCDlg, users, setSearchVal, onSearch }) => {
  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Autocomplete
        value={searchVal}
        onChange={(event, newValue, reason) => {
          if (
            (event.type === 'keydown' && event.key === 'Backspace' && reason === 'removeOption') ||
            (event.type === 'change' && reason === 'clear')
          )
            return;
          // if (users.map((item) => item.email).includes(searchVal) || !searchVal || !searchVal.includes('@') || !searchVal.includes('.'))
          //   return;
          toggleOpenCDlg(true);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          if (users.map((item) => item.email).includes(searchVal) || !searchVal || !searchVal.includes('@') || !searchVal.includes('.'))
            return filtered;
          filtered.push({
            inputValue: searchVal,
            title: `Add "${searchVal}"`
          });
          return filtered;
        }}
        onInputChange={(e, v) => {
          setSearchVal(v);
          onSearch(v);
        }}
        options={[]}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.title;
        }}
        clearOnBlur
        renderOption={(props, option) => <li {...props}>{option.title}</li>}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search email..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        )}
        sx={{ width: 300 }}
      />
    </Grid>
  );
};

SearchInput.propTypes = {
  searchVal: PropTypes.any,
  toggleOpenCDlg: PropTypes.any,
  users: PropTypes.any,
  setSearchVal: PropTypes.any,
  onSearch: PropTypes.any
};
