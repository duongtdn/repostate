'use strict'

import React, { useEffect, useReducer } from 'react';
import { deepClone } from './utils';
import RepoContext from './RepoContext';

class RepoState {

  #state = null;
  #reducers = {};

  getSnapshot = () => deepClone(this.#state);

  // this expose interface for testing purpose only
  __clear = () => {
    this.#state = null;
    this.#reducers = {};
  }

  /**
   * @deprecated Use `add()` instead. This method will be removed in a future version.
   * @param {Object} state - Initial state object
   */
  initState = (state) => {
    if (this.#state === null) {
      this.#state = deepClone(state);
    } else {
      throw new Error('State already initialized');
    }
  }

  add = (stateToAdd, reducers = []) => {
    if (!stateToAdd || typeof stateToAdd !== 'object') {
      throw new Error('State to add must be a valid object');
    }

    // Initialize state if it's null (replaces initState functionality)
    if (this.#state === null) {
      this.#state = deepClone(stateToAdd);
    } else {
      // Deep merge with existing state, throw on conflicts
      this.#state = this.#deepMerge(this.#state, stateToAdd);
    }

    // Add reducers if provided
    if (Array.isArray(reducers)) {
      reducers.forEach(({ path, type, reducer }) => {
        this.addReducer(path, type, reducer);
      });
    }

    // Notify Provider instances of state change
    this.#notifyStateChange();
  }

  #deepMerge = (target, source) => {
    const result = deepClone(target);

    const merge = (targetObj, sourceObj, path = '') => {
      Object.keys(sourceObj).forEach(key => {
        const targetValue = targetObj[key];
        const sourceValue = sourceObj[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (targetValue && typeof targetValue === 'object' &&
            sourceValue && typeof sourceValue === 'object' &&
            !Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
          // Both are objects, merge recursively
          merge(targetValue, sourceValue, currentPath);
        } else if (targetObj.hasOwnProperty(key)) {
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
  }

  #stateChangeCallbacks = new Set();

  #notifyStateChange = () => {
    this.#stateChangeCallbacks.forEach(callback => callback(this.#state));
  }

  #subscribeToStateChanges = (callback) => {
    this.#stateChangeCallbacks.add(callback);
    return () => this.#stateChangeCallbacks.delete(callback);
  }

  getReducers = () => this.#reducers;

  addReducer = (statePath, type, reduceFn) => {
    if (statePath && !this.#doesStatePathExist(statePath)) {
      throw new Error(`State path "${statePath}" does not exist`);
    }

    const pathKey = statePath === null ? '@' : statePath.trim();

    if (!this.#reducers[pathKey]) {
      this.#reducers[pathKey] = {};
    }

    if (this.#reducers[pathKey][type]) {
      throw new Error(`Reducer for statePath "${pathKey}" and type "${type}" already exists`);
    }

    this.#reducers[pathKey][type] = reduceFn;
  };

  #doesStatePathExist = (statePath) => {
    if (statePath === null || statePath === '@') {
      return true;
    }
    const paths = statePath.split('.');
    let current = this.#state;

    for (let path of paths) {
      if (!current || !current.hasOwnProperty(path)) {
        return false;
      }
      current = current[path];
    }
    return true;
  };

  #dispatchReducer = (state, action) => {

    // Handle external state updates from add() method
    if (action.type === '__EXTERNAL_STATE_UPDATE__') {
      return action.newState;
    }

    const { statePath, type, value } = action;

    if (statePath && !this.#doesStatePathExist(statePath)) {
      throw new Error(`State path "${statePath}" does not exist`);
    }

    // Helper function to update the state at a specific path
    const applyUpdateToState = (state, path, updatedSubState) => {
      if (path) {
        const updatedState = deepClone(state);

        const pathParts = path.split('.');
        let current = updatedState;

        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }

        current[pathParts[pathParts.length - 1]] = updatedSubState;

        return updatedState;
      } else {
        return updatedSubState;
      }
    };

    const pathToClone = statePath === null || statePath === undefined || statePath === '@' ? null : statePath;

    const reducer = this.#reducers?.[statePath || '@']?.[type];

    if (!reducer && (type === null || type === undefined)) {
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
  __dispatch = (statePath, type, value) => {
    const action = { statePath, type, value };
    return this.#dispatchReducer(this.#state, action);
  }

  Provider = ({children}) => {
    const [state, dispatch] = useReducer(this.#dispatchReducer, this.#state);

    useEffect(() => {
      this.#state = deepClone(state);
    }, [state]);

    // Subscribe to external state changes (from add() method)
    useEffect(() => {
      const unsubscribe = this.#subscribeToStateChanges((newState) => {
        // Force re-render with new state
        dispatch({ type: '__EXTERNAL_STATE_UPDATE__', newState });
      });
      return unsubscribe;
    }, []);

    return (
      <RepoContext.Provider
        value={{
          state,
          dispatch
         }}
      >
        {children}
      </RepoContext.Provider>
    )
  }

}

export default new RepoState();
