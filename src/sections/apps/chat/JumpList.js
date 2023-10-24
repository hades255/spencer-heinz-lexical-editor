import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import { Divider, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';

// project imports
import { useSelector } from 'store';
import { v4 as uuidv4 } from 'uuid';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'store';

function JumpList({ search }) {
  const [data, setData] = useState([]);
  const { navList } = useSelector((state) => state.document);
  const dispatch = useDispatch();

  useEffect(() => {
    setData(navList);
  }, [navList]);

  useEffect(() => {
    if (search) {
      const results = navList.filter((row) => {
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
      setData(navList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleNavClick = (navData) => {
    const { uniqueId } = navData;
    const targetElement = document.getElementById(uniqueId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // ! set selection of editor as start of jump node
      let range = new Range();

      range.setStart(targetElement, 1);
      range.setEnd(targetElement, 1);

      // apply the selection, explained later below
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(range);
    } else {
      dispatch(
        openSnackbar({
          open: true,
          message: 'No content linked to this nav item.',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }
  };

  return (
    <List component="nav">
      {data.map((navItem) => (
        <Fragment key={uuidv4()}>
          <ListItemButton
            sx={{ pl: 1, ml: (navItem.level - 1) * 5 }}
            onClick={() => {
              handleNavClick(navItem);
            }}
          >
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
                    {navItem.text?.slice(0, 10)}
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
        </Fragment>
      ))}
    </List>
  );
}

JumpList.propTypes = {
  search: PropTypes.string
};

export default JumpList;
