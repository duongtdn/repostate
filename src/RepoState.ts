import React, { useEffect, useReducer } from 'react';
import { deepClone } from './utils';
import RepoContext from './RepoContext';
import type {
  StateObject,
  Reducer,
  ReducerConfig,
  ProviderProps,
  StatePath,
  ActionType,
  DispatchFunction,
  DispatchAction
} from './types';

interface InternalDispatchAction {
  statePath: string | null;
  type: string | null | undefined;
  value: any;
}

interface ExternalStateUpdateAction {
  type: '__EXTERNAL_STATE_UPDATE__';
  newState: StateObject;
}

type AllDispatchActions = InternalDispatchAction | ExternalStateUpdateAction;

class RepoState {
  private state: StateObject | null = null;
  private reducers: Record<string, Record<string, Reducer>> = {};
  private stateChangeCallbacks = new Set<(state: StateObject) => void>();

  // Hook properties for convenience access
  useRepoState?: any;
  useRepoDispatch?: any;

  getSnapshot = (): StateObject => {
    if (this.state === null) {
      throw new Error('State not initialized');
    }
    return deepClone(this.state);
  };

  // this expose interface for testing purpose only
  __clear = (): void => {
    this.state = null;
    this.reducers = {};
    this.stateChangeCallbacks.clear();
  };

  add = (stateToAdd: StateObject, reducers: ReducerConfig[] = []): void => {
    if (!stateToAdd || typeof stateToAdd !== 'object') {
      throw new Error('State to add must be a valid object');
    }

    // Initialize state if it's null (replaces initState functionality)
    if (this.state === null) {
      this.state = deepClone(stateToAdd);
    } else {
      // Deep merge with existing state, throw on conflicts
      this.state = this.deepMerge(this.state, stateToAdd);
    }

    // Add reducers if provided
    if (Array.isArray(reducers)) {
      reducers.forEach(({ path, type, reducer }) => {
        this.addReducer(path, type, reducer);
      });
    }

    // Notify Provider instances of state change
    this.notifyStateChange();
  };

  private deepMerge = (target: StateObject, source: StateObject): StateObject => {
    const result = deepClone(target);

    const merge = (targetObj: StateObject, sourceObj: StateObject, path = ''): void => {
      Object.keys(sourceObj).forEach(key => {
        const targetValue = targetObj[key];
        const sourceValue = sourceObj[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (targetValue && typeof targetValue === 'object' &&
            sourceValue && typeof sourceValue === 'object' &&
            !Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
          // Both are objects, merge recursively
          merge(targetValue, sourceValue, currentPath);
        } else if (Object.prototype.hasOwnProperty.call(targetObj, key)) {
          // Conflict detected - existing value would be overwritten
          throw new Error(`State conflict detected at path: ${currentPath}`);
        } else {
          // No conflict, set the value
          targetObj[key] = deepClone(sourceValue);
        }
      });
    };

    merge(result, source);
    return result;
  };

  private notifyStateChange = (): void => {
    if (this.state) {
      this.stateChangeCallbacks.forEach(callback => callback(this.state!));
    }
  };

  private subscribeToStateChanges = (callback: (state: StateObject) => void): (() => void) => {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  };

  getReducers = (): Record<string, Record<string, Reducer>> => this.reducers;

  addReducer = (statePath: string, type: string, reduceFn: Reducer): void => {
    if (statePath && !this.doesStatePathExist(statePath)) {
      throw new Error(`State path "${statePath}" does not exist`);
    }

    const pathKey = statePath === null ? '@' : statePath.trim();

    if (!this.reducers[pathKey]) {
      this.reducers[pathKey] = {};
    }

    if (this.reducers[pathKey]![type]) {
      throw new Error(`Reducer for statePath "${pathKey}" and type "${type}" already exists`);
    }

    this.reducers[pathKey]![type] = reduceFn;
  };

  private doesStatePathExist = (statePath: string): boolean => {
    if (statePath === null || statePath === '@') {
      return true;
    }

    if (!this.state) {
      return false;
    }

    const paths = statePath.split('.');
    let current: any = this.state;

    for (const path of paths) {
      if (!current || !Object.prototype.hasOwnProperty.call(current, path)) {
        return false;
      }
      current = current[path];
    }
    return true;
  };

  private dispatchReducer = (state: StateObject, action: AllDispatchActions): StateObject => {
    // Handle external state updates from add() method
    if (action.type === '__EXTERNAL_STATE_UPDATE__') {
      return (action as ExternalStateUpdateAction).newState;
    }

    const { statePath, type, value } = action as InternalDispatchAction;

    if (statePath && !this.doesStatePathExist(statePath)) {
      throw new Error(`State path "${statePath}" does not exist`);
    }

    // Validate type is a string (except for null/undefined which are handled separately)
    if (type !== null && type !== undefined && typeof type !== 'string') {
      throw new Error(`Action type must be a string, received: ${typeof type}`);
    }

    // Helper function to update the state at a specific path
    const applyUpdateToState = (state: StateObject, path: string | null, updatedSubState: any): StateObject => {
      if (path) {
        const updatedState = deepClone(state);
        const pathParts = path.split('.');
        let current: any = updatedState;

        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]!];
        }

        current[pathParts[pathParts.length - 1]!] = updatedSubState;
        return updatedState;
      } else {
        return updatedSubState;
      }
    };

    const pathToClone = statePath === null || statePath === undefined || statePath === '@' ? null : statePath;

    const reducer = this.reducers?.[statePath || '@']?.[type || ''];

    if (!reducer && (type === null || type === undefined || type.toLowerCase() === 'set')) {
      // Default reducer behavior: directly override the value
      return applyUpdateToState(state, pathToClone, value);
    }

    if (!reducer) {
      throw new Error(`No reducer found for statePath: ${statePath} and type: ${type}`);
    }

    const clonedState = pathToClone ? deepClone(state, pathToClone) : deepClone(state);
    const updatedSubState = reducer(clonedState, value);

    return applyUpdateToState(state, pathToClone, updatedSubState);
  };

  // this expose interface for testing dispatchReducer only
  __dispatch = (statePath: string | null, type: string | null, value?: any): StateObject => {
    if (!this.state) {
      throw new Error('State not initialized');
    }
    const action: InternalDispatchAction = { statePath, type, value };
    return this.dispatchReducer(this.state, action);
  };

  /**
   * Dispatch an action to update state from outside React components
   * @param statePath - The path to the state (null or '@' for root)
   * @param type - The action type
   * @param value - The value to pass to the reducer
   */
  dispatch: DispatchFunction = (statePath: StatePath, type: ActionType, value?: any): void => {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const action: InternalDispatchAction = {
      statePath: statePath || null,
      type: type || null,
      value
    };

    // Update the internal state
    this.state = this.dispatchReducer(this.state, action);

    // Notify all subscribers (React Provider instances) of the change
    this.notifyStateChange();
  };

  Provider = ({ children }: ProviderProps): React.JSX.Element => {
    const [state, dispatch] = useReducer(this.dispatchReducer, this.state || {});

    useEffect(() => {
      this.state = deepClone(state);
    }, [state]);

    // Subscribe to external state changes (from add() method and dispatch())
    useEffect(() => {
      const unsubscribe = this.subscribeToStateChanges((newState) => {
        // Force re-render with new state
        const action: ExternalStateUpdateAction = {
          type: '__EXTERNAL_STATE_UPDATE__',
          newState
        };
        dispatch(action);
      });
      return unsubscribe;
    }, []);

    return React.createElement(
      RepoContext.Provider,
      {
        value: {
          state,
          dispatch: (action: DispatchAction) => dispatch(action as AllDispatchActions)
        }
      },
      children
    );
  };
}

export default new RepoState();