import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';

const stringToColor = (string) => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
};

const stringAvatar = (name, xs = false, xl = false) => {
  const add = xs ? { fontSize: 15, width: 30, height: 30 } : xl ? { fontSize: 60, width: 124, height: 124 } : {};
  return {
    sx: {
      bgcolor: stringToColor(name),
      cursor: 'pointer',
      ...add
    },
    children: name.indexOf(' ') === -1 ? name[0] : `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
  };
};

const BackgroundLetterAvatar = ({ name = '', xs, xl, ...props }) => {
  return <Avatar {...stringAvatar(name, xs, xl)} {...props} />;
};

BackgroundLetterAvatar.propTypes = {
  name: PropTypes.string
};

export default BackgroundLetterAvatar;
