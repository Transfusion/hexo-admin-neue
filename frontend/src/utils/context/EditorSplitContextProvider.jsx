/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import usePersistedState from '../Utils';

export const MODES = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
};

export const EditorSplitContext = React.createContext();

export const EditorSplitContextProvider = (props) => {
  const [mode, setMode] = usePersistedState('editorSplitMode', MODES.HORIZONTAL);

  // hence context is essentially equal to { splitMode, setSplitMode }
  const context = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <EditorSplitContext.Provider
      value={context}
      {...props}
    />
  );
};
