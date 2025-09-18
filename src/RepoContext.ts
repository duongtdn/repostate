import { createContext } from 'react';
import type { RepoContextValue } from './types';

const RepoContext = createContext<RepoContextValue | null>(null);

export default RepoContext;