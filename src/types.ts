import type { ReactNode } from 'react';

// Generic type for any state object
export type StateObject = Record<string, any>;

// Type for reducer functions
export type Reducer<TState = any, TValue = any> = (state: TState, value: TValue) => TState;

// Type for reducer configuration
export interface ReducerConfig<TState = any, TValue = any> {
  path: string;
  type: string;
  reducer: Reducer<TState, TValue>;
}

// Type for dispatch actions
export interface DispatchAction {
  statePath: string | null;
  type: string | null | undefined;
  value: any;
}

// Type for the dispatch function
export type DispatchFunction = (statePath: string | null, type: string | null | undefined, value?: any) => void;

// Type for the useRepoState hook return value
export type UseRepoStateReturn<T = any> = [T, DispatchFunction];

// Type for the RepoContext value
export interface RepoContextValue {
  state: StateObject;
  dispatch: (action: DispatchAction) => void;
}

// Type for the Provider props
export interface ProviderProps {
  children: ReactNode;
}

// Type for state path - can be string or special values
export type StatePath = string | null | undefined | '@';

// Type for action types
export type ActionType = string | null | undefined;