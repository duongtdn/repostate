'use strict'

import { deepClone } from './utils';

class RepoState {

  #state = null;
  #reducers = {};

  getSnapshot = () => deepClone(this.#state);

  clear = () => {
    this.#state = null;
    this.#reducers = {};
  }

  initState = (state) => {
    if (this.#state === null) {
      this.#state = deepClone(state);
    } else {
      throw new Error('State already initialized');
    }
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

  dispatchReducer = (state, action) => {

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





}

export default new RepoState();
