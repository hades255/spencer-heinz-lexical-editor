import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useSelector } from 'store';

const ActiveTeamPlugin = () => {
  const activeTeam = useSelector((state) => state.document.activeTeam);
  const user = useSelector((state) => state.document.me);
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
