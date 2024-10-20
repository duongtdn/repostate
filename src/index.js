import RepoState from './RepoState';
import useRepoState from './useRepoState.hook';
import useRepoDispatch from './useRepoDispatch.hook';

RepoState.useRepoState = useRepoState;
RepoState.useRepoDispatch = useRepoDispatch;

export default RepoState;
export { useRepoState, useRepoDispatch };
