import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Box, Chip, IconButton, Stack, TextField } from '@mui/material';
import { StatusCell } from 'pages/apps/customer/list';
import { useAsyncDebounce } from 'react-table';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import AddNewInviteConfirmDlg from './AddNewInviteConfirmDlg';
import AddNewInviteDlg from './AddNewInviteDlg';
import { intersection, not, union } from 'utils/array';
import { StarFilled } from '@ant-design/icons';
import { StarOutline } from '@mui/icons-material';
import axiosServices from 'utils/axios';
const filter = createFilterOptions();

export const ReplyCell = ({ value }) => {
  switch (value) {
    case 'pending':
      return <Chip color="info" label="Pending" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
    case 'accept':
      return <Chip color="success" label="Accepted" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
    case 'reject':
      return <Chip color="warning" label="Rejected" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
    case 'You':
      return <Chip color="primary" label="You" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
    case 'Creator':
      return <Chip color="error" label="Creator" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
    case 'Creator/You':
      return <Chip color="error" label="Crea/You" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
    default:
      return <Chip color="info" label="Pending" size="small" variant="light" sx={{ p: 0, m: 0, fontSize: 11 }} />;
  }
};

ReplyCell.propTypes = {
  value: PropTypes.string
};

const ListCell = ({ user, dbClick, dir, reply, favourites, setFavourites }) => {
  const [show, setShow] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShow(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShow(false);
  }, []);

  const handleClickStar = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setFavourites(user.email, !favourites.includes(user.email));
    },
    [setFavourites, favourites, user]
  );

  const handleDbClick = useCallback(() => {
    dbClick(user.email, dir);
  }, [dbClick, user, dir]);

  return user ? (
    <Stack
      direction={'row'}
      justifyContent={'space-between'}
      onDoubleClick={handleDbClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CustomCell user={user} />
      <Stack>
        <StatusCell value={user.status} />
        {!dir && <ReplyCell value={reply || user.reply} />}
      </Stack>
      {!reply && (
        <Box
          sx={{
            position: 'absolute',
            right: '20px',
            top: '10px',
            visibility: show || favourites.includes(user.email) ? 'visible' : 'hidden',
            width: 20,
            height: 20,
            borderRadius: 10,
            background: favourites.includes(user.email) ? 'white' : '#1677FF'
          }}
          onClick={handleClickStar}
        >
          {favourites.includes(user.email) ? (
            <StarFilled style={{ fontSize: 20, color: 'gold' }} />
          ) : (
            <StarOutline style={{ fontSize: 20, color: 'white' }} />
          )}
        </Box>
      )}
    </Stack>
  ) : (
    <></>
  );
};

ListCell.propTypes = {
  user: PropTypes.object,
  dbClick: PropTypes.func,
  setFavourites: PropTypes.func,
  dir: PropTypes.bool,
  favourites: PropTypes.array,
  reply: PropTypes.string
};

export default function AddContributor({ users, value, onChange, exist = [], mine = null, user, team = false }) {
  const [checked, setChecked] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [openDlg, toggleOpenDlg] = useState(false);
  const [openCDlg, toggleOpenCDlg] = useState(false);
  const inputRef = useRef(null);
  const [showStars, setShowStars] = useState(false);
  const [favourites, setFavourites] = useState([]);

  const getFavouriteUsers = useCallback(() => {
    (async () => {
      try {
        const res = await axiosServices.get('/user/favourite');
        setFavourites(res.data.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const setFavouriteUser = useCallback(
    (email, flag) => {
      (async () => {
        try {
          const res = await axiosServices.put('/user/favourite', { email, flag });
          const { email: _email, flag: _flag } = res.data.data;
          const f = favourites.filter((item) => item !== _email);
          setFavourites(_flag ? [...f, _email] : f);
        } catch (error) {
          console.log(error);
        }
      })();
    },
    [favourites]
  );

  useEffect(() => {
    getFavouriteUsers();
  }, [getFavouriteUsers]);

  const leftChecked = intersection(
    checked,
    users.filter((item) => !value.includes(item.email)).map((item) => item.email)
  );
  const rightChecked = intersection(checked, value);

  const handleToggle = useCallback(
    (item) => () => {
      const currentIndex = checked.indexOf(item);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(item);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setChecked(newChecked);
    },
    [checked]
  );

  const numberOfChecked = useCallback((items) => intersection(checked, items).length, [checked]);

  const handleToggleAll = useCallback(
    (items) => () => {
      if (numberOfChecked(items) === items.length) {
        setChecked(not(checked, items));
      } else {
        setChecked(union(checked, items));
      }
    },
    [checked, numberOfChecked]
  );

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

  const handleCloseCDlg = useCallback((res = false) => {
    toggleOpenCDlg(false);
    toggleOpenDlg(res);
  }, []);

  const handleCloseDlg = useCallback(
    (email = '') => {
      toggleOpenDlg(false);
      if (email) onChange([...value, email]);
      setSearchVal('');
    },
    [onChange, value]
  );

  const handleSetFavourite = useCallback(
    (email, flag) => {
      setFavouriteUser(email, flag);
    },
    [setFavouriteUser]
  );

  const handleShowStars = useCallback(() => {
    setShowStars(!showStars);
  }, [showStars]);

  const customList = useCallback(
    (title, items) => {
      const ids = items.filter((item) => user.email !== item.email && (mine ? mine.email !== item.email : true)).map((item) => item.email);
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
            action={
              title === 'Choices' && (
                <IconButton onClick={handleShowStars}>
                  <StarFilled style={{ transition: 'ease-in-out 0.2s', color: showStars ? 'gold' : 'grey' }} />
                </IconButton>
              )
            }
          />
          <Divider />
          <List
            sx={{
              width: 380,
              height: '40vh',
              minHeight: 250,
              bgcolor: 'background.paper',
              overflow: 'auto'
            }}
            dense
            component="div"
            role="list"
          >
            {items
              .filter((item) => (showStars ? favourites.includes(item.email) : true))
              .map((item, key) => {
                const labelId = `transfer-list-all-item-${item.email}-label`;

                return user.email === item.email || mine?.email === item.email ? (
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
                    <ListItemText
                      id={labelId}
                      primary={
                        <ListCell
                          user={exist.find((x) => x.email === item.email)}
                          dbClick={() => {}}
                          dir={title === 'Choices'}
                          reply={
                            user.email === item.email
                              ? mine?.email === item.email
                                ? 'Creator/You'
                                : 'You'
                              : mine?.email === item.email
                              ? 'Creator'
                              : ''
                          }
                        />
                      }
                    />
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
                    <ListItemText
                      id={labelId}
                      primary={
                        <ListCell
                          user={exist.find((x) => x.email === item.email) || item}
                          dbClick={handleDbClick}
                          dir={title === 'Choices'}
                          favourites={favourites}
                          setFavourites={handleSetFavourite}
                        />
                      }
                    />
                  </ListItem>
                );
              })}
          </List>
        </Card>
      );
    },
    [
      mine,
      user,
      showStars,
      checked,
      exist,
      favourites,
      handleDbClick,
      handleSetFavourite,
      handleShowStars,
      handleToggle,
      handleToggleAll,
      numberOfChecked
    ]
  );

  return (
    <Stack sx={{ m: 1 }}>
      {!team && (
        <SearchInput
          searchVal={searchVal}
          toggleOpenCDlg={toggleOpenCDlg}
          users={users}
          setSearchVal={setSearchVal}
          onSearch={onSearch}
          inputRef={inputRef}
        />
      )}
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
  user: PropTypes.any,
  value: PropTypes.any,
  exist: PropTypes.any,
  mine: PropTypes.any,
  team: PropTypes.any,
  onChange: PropTypes.func
};

const SearchInput = ({ searchVal, toggleOpenCDlg, users, setSearchVal, onSearch, inputRef }) => {
  useEffect(() => {
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  }, [inputRef]);

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
        disableClearable
        options={[]}
        autoHighlight
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
        renderOption={(props, option) => (
          <li {...props} style={{ background: '#1677FF', color: 'white' }}>
            {option.title}
          </li>
        )}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search email..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            inputRef={inputRef}
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
  onSearch: PropTypes.any,
  inputRef: PropTypes.any
};
