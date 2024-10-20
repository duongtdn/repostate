# RepoState

RepoState is a lightweight state management solution for React applications. It provides global state management with hooks for accessing and updating the state at different paths within your state tree. RepoState allows for a clean and modular way to manage application state.

## Installation

```bash
npm install repostate --save
```

## Usage

### Initializing the State

To use RepoState, first initialize the state with your default state structure.

```javascript
import RepoState from 'repostate';

const initialState = {
  user: {
    name: 'John',
    age: 30
  },
  settings: {
    theme: 'dark'
  }
};

RepoState.initState(initialState);
```

### Setting Reducers

You can add reducers to manage specific state paths and actions.
Reducers are functions that take the current state and the new value, then return an updated state.
They only need to focus on the specific portion of the state related to their business logic, without requiring knowledge of the entire state, making them modular and easier to maintain.

```javascript
RepoState.addReducer('user.age', 'increase', (state, value) => state + value);
RepoState.addReducer('settings.theme', 'toggle', (state) => (state === 'dark' ? 'light' : 'dark'));
```

### Using RepoState in a React App

Wrap your app or specific components with the `RepoState.Provider` to make the state available:

```javascript
import React from 'react';
import RepoState from 'repostate';

const App = () => (
  <RepoState.Provider>
    <YourComponent />
  </RepoState.Provider>
);

export default App;
```

### Accessing and Updating State

You can use the `useRepoState` and `useRepoDispatch` hooks to access and update the state.

#### Example 1: Using `useRepoState` Hook

The `useRepoState` hook allows you to access and update a specific part of the state by specifying a `statePath`. If the `statePath` is `null`, `undefined`, or `'@'`, the entire state is returned.

```javascript
import { useRepoState } from 'repostate';

const UserProfile = () => {
  const [userName, dispatchUserName] = useRepoState('user.name');
  const [userAge, dispatchUserAge] = useRepoState('user.age');
  return (
    <div>
      <p>Username: {userName}</p>
      <button onClick={() => dispatchUserName(null, 'Jane')}>Change Username</button>
      <p>Age: {userAge}</p>
      <button onClick={() => dispatchUserAge('increase', 'Jane')}>Increase</button>
    </div>
  );
};
```
If the `type` in the `dispatch` call is `null`, the default behavior is to directly overwrite the state at the specified `statePath` with the provided value. For example:

```javascript
const [userName, dispatchUserName] = useRepoState('user.name');
//...
<button onClick={() => dispatchUserName(null, 'Jane')}>Change Username</button>
```

#### Accessing the Entire State

If you want to access the entire state, you can pass `null`, `undefined`, or `'@'` as the `statePath`.

```javascript
const [state, dispatch] = useRepoState(); // Or use '@' or null
```

#### Example 2: Using `useRepoDispatch` Hook

The `useRepoDispatch` hook provides a global dispatch function that can be used to update any part of the state. The `dispatch` function takes three arguments: `statePath`, `type`, and `value`.

```javascript
import { useRepoDispatch } from 'repostate';

const ThemeToggle = () => {
  const dispatch = useRepoDispatch();

  return (
    <button onClick={() => dispatch('settings.theme', 'toggle')}>
      Toggle Theme
    </button>
  );
};
```

**Note:** A reducer must be defined for the specified `statePath` and `type`; otherwise, an error will be thrown. If `type` is `null`, the default behavior of directly overwriting the state at the given `statePath` is applied.

### Accessing Hooks from `RepoState`

You can also access the hooks via the `RepoState` object:

```javascript
import RepoState from 'repostate';

const YourComponent = () => {
  const [user, dispatch] = RepoState.useRepoState('user');
  const globalDispatch = RepoState.useRepoDispatch();

  return (
    <div>
      <p>User: {user.name}</p>
      <button onClick={() => dispatch(null, { name: 'Doe' })}>Change Name</button>
      <button onClick={() => globalDispatch('settings.theme', 'toggle')}>Toggle Theme</button>
    </div>
  );
};
```

## API

### RepoState

- **`initState(state)`**: Initializes the global state. Can only be called once.
- **`getSnapshot()`**: Returns a deep clone of the current state.
- **`addReducer(statePath, type, reduceFn)`**: Adds a reducer function for a specific `statePath` and `type`.

### `useRepoState(statePath)`

A React hook that provides access to a specific substate and a function to update that substate.

- **`statePath`**: A string representing the path to the desired state. If `statePath` is `null`, `undefined`, or `'@'`, it returns the entire state.

Returns an array `[subState, dispatchFn]`:
- **`subState`**: The current value of the substate at `statePath`.
- **`dispatchFn(type, value)`**: A function to dispatch an action to update the state at the specified `statePath`. If `type` is `null`, the default behavior of directly overwriting the state at the given `statePath` with given `value` is applied.

### `useRepoDispatch()`

A React hook that returns a `dispatch` function for updating the state directly.

- **`dispatch(statePath, type, value)`**: Dispatches an action to update the state at the specified `statePath`. If `type` is `null`, the default behavior of directly overwriting the state at the given `statePath` with given `value` is applied.

## License

This project is licensed under the MIT License.
