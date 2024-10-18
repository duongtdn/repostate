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
    const pathKey = statePath === null ? '@' : statePath.trim();

    if (statePath && !this.#doesStatePathExist(statePath)) {
      throw new Error(`State path "${statePath}" does not exist`);
    }

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


}

export default new RepoState();
