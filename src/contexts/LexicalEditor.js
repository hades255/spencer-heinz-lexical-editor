import { createEmptyHistoryState } from '@lexical/react/LexicalHistoryPlugin';
import { createContext, useContext, useMemo } from 'react';

const Context = createContext({});

export const EditorHistoryStateContext = ({ children }) => {
  const h = useMemo(() => ({ historyState: createEmptyHistoryState() }), []);
  return <Context.Provider value={h}>{children}</Context.Provider>;
};

export function useEditorHistoryState() {
  return useContext(Context);
}
