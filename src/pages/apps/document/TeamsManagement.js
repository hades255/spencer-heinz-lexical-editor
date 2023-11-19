import { useCallback, useState } from 'react';
import { AvatarGroup, Box, Chip, DialogContent, DialogContentText, Radio, Stack, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import UserAvatar from 'sections/apps/user/UserAvatar';
import { MobileOutlined, PhoneOutlined } from '@ant-design/icons';
import { PatternFormat } from 'react-number-format';
import CustomCell from 'components/customers/CustomCell';
import { StatusCell } from '../customer/list';

const TeamsManagement = ({ users, socket, activeTeam }) => {
  let _teams = {};
  for (let u of users.filter((item) => item.team)) {
    if (u.team) {
      if (_teams[u.team]) {
        _teams[u.team] = {
          name: u.team,
          leader: u.leader ? u : _teams[u.team].leader,
          members: u.leader ? _teams[u.team].members : [..._teams[u.team].members, u]
        };
      } else {
        _teams[u.team] = { name: u.team, leader: u.leader ? u : null, members: u.leader ? [] : [u] };
      }
    }
  }

  const teams = Object.values(_teams);

  const [expanded, setExpanded] = useState(false);
  const handleChange = useCallback(
    (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  return (
    <>
      <DialogContent sx={{ minHeight: 300 }}>
        <DialogContentText>Manage Teams</DialogContentText>
        <div>
          {teams.map((item, key) => (
            <TeamItem
              key={key}
              socket={socket}
              team={item}
              activeTeam={item.name === activeTeam}
              expanded={expanded === item.name}
              handleChange={handleChange}
            />
          ))}
        </div>
        <Stack sx={{ mt: 3, mb: 1 }}>
          <Typography>Users not in Team</Typography>
        </Stack>
        <Stack spacing={0.3} sx={{ maxHeight: 400, overflowY: 'scroll' }}>
          {users
            .filter((item) => !item.team)
            .map((item, key) => (
              <Stack key={key} direction={'row'} alignItems={'center'} spacing={0.3}>
                <Typography sx={{ width: 100, flexShrink: 0 }}></Typography>
                <UserItem user={item} />
              </Stack>
            ))}
        </Stack>
      </DialogContent>
    </>
  );
};

export default TeamsManagement;

TeamsManagement.propTypes = {
  users: PropTypes.any,
  activeTeam: PropTypes.any,
  socket: PropTypes.any
};

const TeamItem = ({ team, socket, activeTeam, expanded, handleChange }) => {
  const handleSetActive = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      socket.send(JSON.stringify({ type: 'set-active', team: team.name }));
    },
    [socket, team]
  );

  return (
    <Accordion expanded={expanded} onChange={handleChange(team.name)}>
      <AccordionSummary
        expandIcon={
          <Tooltip title="Set Active author status">
            <Radio checked={activeTeam} onChange={() => {}} onClick={handleSetActive} />
          </Tooltip>
        }
        aria-controls={`${team.name}-content`}
        id={`${team.name}-header`}
      >
        <Stack sx={{ width: 150, flexShrink: 0 }} justifyContent={'center'}>
          <Typography>{team.name}</Typography>
        </Stack>
        <Stack direction={'row'} alignItems={'center'} spacing={0.3}>
          <UserAvatar user={team.leader} />
          <Typography>{team.leader.name}</Typography>
        </Stack>
        <Stack direction={'row'} justifyContent={'end'} flexGrow={'inherit'}>
          <AvatarGroup max={5}>
            {team.members.map((item, key) => (
              <UserAvatar key={key} user={item} />
            ))}
          </AvatarGroup>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={0.3}>
          <Stack direction={'row'} alignItems={'center'} spacing={0.3}>
            <Typography sx={{ width: 100, flexShrink: 0 }}>Team Leader</Typography>
            <UserItem user={team.leader} />
          </Stack>
          {team.members.map((item, key) => (
            <Stack key={key} direction={'row'} alignItems={'center'} spacing={0.3}>
              <Typography sx={{ width: 100, flexShrink: 0 }}>{key === 0 && 'Members'}</Typography>
              <UserItem user={item} />
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

TeamItem.propTypes = {
  team: PropTypes.any,
  socket: PropTypes.any,
  activeTeam: PropTypes.any,
  expanded: PropTypes.any,
  handleChange: PropTypes.any
};

const UserItem = ({ user }) => {
  return (
    <Stack flexGrow={'inherit'} direction={'row'} alignItems={'center'} spacing={0.3} width={'100%'} flexWrap={'wrap'}>
      <Box sx={{ width: '30%', minWidth: 180 }}>
        <CustomCell user={user} />
      </Box>
      <Stack sx={{ width: '30%', minWidth: 150 }} spacing={0}>
        <Typography variant="" color="textSecondary">
          <MobileOutlined style={{ borderRadius: '10px' }} />
          <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.mobilePhone} />
        </Typography>
        <Typography variant="" color="textSecondary">
          <PhoneOutlined />
          <PatternFormat displayType="text" format=" +1 (###) ###-####" mask="_" defaultValue={user.workPhone} />
        </Typography>
      </Stack>
      <Stack direction={'row'}>
        <Stack sx={{ width: 70 }}>
          <Typography color={'textSecondary'} textAlign={'center'}>
            Status
          </Typography>
          <StatusCell value={user.status} />
        </Stack>
        <Stack sx={{ width: 100 }}>
          <Typography color={'textSecondary'} textAlign={'center'}>
            Reply
          </Typography>
          <Chip
            label={user.reply.toUpperCase()}
            size="small"
            variant="light"
            color={user.reply === 'accept' ? 'success' : user.reply === 'pending' ? 'primary' : 'info'}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

UserItem.propTypes = {
  user: PropTypes.any
};
