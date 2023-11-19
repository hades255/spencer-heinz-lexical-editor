import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const ActiveTeamPlugin = ({ user, activeTeam }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (user && editor) {
      if (user.team === activeTeam) editor.setEditable(true);
      else editor.setEditable(false);
    }
  }, [editor, user, activeTeam]);

  return <></>;
};

export default ActiveTeamPlugin;

ActiveTeamPlugin.propTypes = {
  user: PropTypes.any,
  activeTeam: PropTypes.any
};
