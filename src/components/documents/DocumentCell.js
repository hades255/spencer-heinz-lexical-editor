import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import { TruncatedText } from 'utils/string';
import moment from 'moment';

// const getDate = (date) => {
//   const targetDateTime = moment(date);

//   const currentDate = moment();
//   const targetDate = targetDateTime.startOf('day');

//   if (currentDate.isSame(targetDate, 'day')) {
//     return targetDateTime.fromNow(true);
//   } else {
//     return targetDateTime.format('MMMM Do, YYYY [at] h:mm A');
//   }
// };

const DocumentCell = ({ row }) => {
  const { values } = row;
  const [show, setShow] = useState(false);

  const handleShowMore = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShow((s) => !s);
  }, []);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={'space-between'}>
      <Stack spacing={0}>
        <Typography variant="subtitle1">{values.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {show ? values.description : TruncatedText(values.description, 150)}
          {values.description.length > 150 && (
            <Typography variant="caption" sx={{ pl: 1, pr: 1, fontWeight: 'bold', color: 'dark' }} onClick={handleShowMore}>
              {show ? 'Hide' : 'More'}
            </Typography>
          )}
        </Typography>
      </Stack>
      <Stack sx={{ width: '100px' }} direction={'row'} justifyContent={'end'}>
        <Typography variant="caption" color="textSecondary">
          {moment(values.updatedAt).fromNow(true)}
        </Typography>
        {/* <Typography variant="caption">Created {moment(values.createdAt).fromNow(true)}</Typography> */}
      </Stack>
    </Stack>
  );
};
DocumentCell.propTypes = {
  row: PropTypes.object
};

export default DocumentCell;
