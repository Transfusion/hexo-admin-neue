import React from 'react';

export function stripFrontMatter(content: String) {
  content = content.trim();
  if (content.startsWith('---')) {
    content = content.substring(3);
  }
  content = content.split('---');
  content.shift();
  content = content.join('---');
  // TODO: what if we do intentionally want to include blank space at the beginning and/or end?
  return content.trim();
}

export default function usePersistedState(key, defaultValue) {
  const [state, setState] = React.useState(() => {
    const persistedState = localStorage.getItem(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });
  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
  return [state, setState];
}
