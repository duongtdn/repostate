"use strict"

import { useContext } from 'react';
import RepoContext from './RepoContext';

const useRepoState = () => {
  const { state, dispatch } = useContext(RepoContext);
  return [state, dispatch];
}

export default useRepoState;
