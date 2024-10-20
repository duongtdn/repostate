"use strict"

import { useContext } from 'react';
import RepoContext from './RepoContext';

const useRepoDispatch = () => {
  const { dispatch } = useContext(RepoContext);
  return (statePath, type, value) => {
    const action = { statePath, type, value };
    dispatch(action);
  };
}

export default useRepoDispatch;
