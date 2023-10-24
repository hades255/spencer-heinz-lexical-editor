import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import { TruncatedText } from 'utils/string';

const DocumentCell = ({ row }) => {
  const { values } = row;
  const [show, setShow] = useState(false);

  const handleShowMore = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShow((s) => !s);
  }, []);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Stack spacing={0}>
        <Typography variant="subtitle1">{values.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {show ? values.description : TruncatedText(values.description, 150)}
          <Typography variant="caption" sx={{ pl: 1, pr: 1, fontWeight: 'bold', color:"dark" }} onClick={handleShowMore}>
            {values.description.length > 150 && (show ? 'Hide' : 'More')}
          </Typography>
        </Typography>
      </Stack>
    </Stack>
  );
};
DocumentCell.propTypes = {
  row: PropTypes.object
};

export default DocumentCell;
