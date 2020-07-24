import React, { Component } from "react";
import usePersistedState from "../Utils";

export const PostsSortMode = {
  UPDATED_DESCENDING: { name: 'Updated descending', code: 'UPDATED_DESCENDING' },
  UPDATED_ASCENDING: { name: 'Updated ascending', code: 'UPDATED_ASCENDING' },

  CREATED_DESCENDING: { name: 'Created descending', code: 'CREATED_DESCENDING' },
  CREATED_ASCENDING: { name: 'Created ascending', code: 'CREATED_ASCENDING' }
}

export const SearchInContext = React.createContext();

// also applies to sorting!
export const SearchInContextProvider = props => {
  const [inTitle, setInTitle] = usePersistedState('searchInTitle', true);
  const [inBody, setInBody] = usePersistedState('searchInBody', true);
  const [postsSortMode, setSortMode] = usePersistedState('postsSortMode', PostsSortMode.UPDATED_DESCENDING.code);

  const context = React.useMemo(() => ({ inTitle, setInTitle, inBody, setInBody, postsSortMode, setSortMode }), [inTitle, setInTitle, inBody, setInBody, postsSortMode, setSortMode]);

  return <SearchInContext.Provider value={context} {...props} />
}
