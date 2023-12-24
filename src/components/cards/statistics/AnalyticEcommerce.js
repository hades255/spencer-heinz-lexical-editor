import PropTypes from 'prop-types';

// material-ui
import { Chip, Grid, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { useCallback } from 'react';

// ==============================|| STATISTICS - ECOMMERCE CARD  ||============================== //

const AnalyticEcommerce = ({ color = 'primary', title, count, percentage, isLoss, onClick = () => {}, index }) => {
  const handleClick = useCallback(() => onClick(index), [onClick, index]);

  return (
    <MainCard contentSX={{ p: 2.25, cursor: 'pointer' }} onClick={handleClick}>
      <Stack spacing={0.5}>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid item>
              <Chip
                variant="combined"
                color={color}
                icon={
                  <>
                    {!isLoss && <RiseOutlined style={{ fontSize: '0.75rem', color: 'inherit' }} />}
                    {isLoss && <FallOutlined style={{ fontSize: '0.75rem', color: 'inherit' }} />}
                  </>
                }
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Stack>
      {/* <Box sx={{ pt: 2.25 }}>
        <Typography variant="caption" color="textSecondary">
          You made an extra{' '}
          <Typography component="span" variant="caption" sx={{ color: `${color || 'primary'}.main` }}>
            {extra}
          </Typography>{' '}
          this year
        </Typography>
      </Box> */}
    </MainCard>
  );
};

AnalyticEcommerce.propTypes = {
  title: PropTypes.string,
  count: PropTypes.any,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  color: PropTypes.string,
  extra: PropTypes.string,
  onClick: PropTypes.func,
  index: PropTypes.any
};

export default AnalyticEcommerce;
