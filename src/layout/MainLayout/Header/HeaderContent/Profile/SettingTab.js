import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { CommentOutlined, LockOutlined, QuestionCircleOutlined, UserOutlined, UnorderedListOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

const SettingTab = ({ onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigation = useNavigate();
  const handleListItemClick = (event, index) => {
    switch (index) {
      case 0:
        navigation('/settings/support');
        break;
      case 1:
        navigation('/settings/account-settings');
        break;
      case 2:
        navigation('/settings/privacy-center');
        break;
      case 3:
        navigation('/settings/feedback');
        break;
      case 4:
        navigation('/settings/history');
        break;
    }
    onClose();

    setSelectedIndex(index);
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0)}>
        <ListItemIcon>
          <QuestionCircleOutlined />
        </ListItemIcon>
        <ListItemText primary="Support" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Account Settings" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 2} onClick={(event) => handleListItemClick(event, 2)}>
        <ListItemIcon>
          <LockOutlined />
        </ListItemIcon>
        <ListItemText primary="Privacy Center" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 3} onClick={(event) => handleListItemClick(event, 3)}>
        <ListItemIcon>
          <CommentOutlined />
        </ListItemIcon>
        <ListItemText primary="Feedback" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 4} onClick={(event) => handleListItemClick(event, 4)}>
        <ListItemIcon>
          <UnorderedListOutlined />
        </ListItemIcon>
        <ListItemText primary="History" />
      </ListItemButton>
    </List>
  );
};

export default SettingTab;
