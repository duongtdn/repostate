# RepoState

RepoState is a lightweight state management solution for React applications. It provides global state management with hooks for accessing and updating the state at different paths within your state tree. RepoState allows for a clean and modular way to manage application state with support for dynamic state composition.

## Installation

```bash
npm install repostate
```

## Usage

### Adding State

RepoState uses `add()` API that allows you to build your state incrementally. This is perfect for modular applications, micro-frontends, or lazy-loaded features.

```javascript
import RepoState from 'repostate';

// Initialize with your core state
RepoState.add({
  user: {
    name: 'John',
    age: 30
  },
  settings: {
    theme: 'dark'
  }
});

// Later, add more state as features are loaded
RepoState.add({
  user: {
    preferences: {
      notifications: true
    }
  },
  cart: {
    items: []
  }
});
// Results in merged state:
// {
//   user: { name: 'John', age: 30, preferences: { notifications: true } },
//   settings: { theme: 'dark' },
//   cart: { items: [] }
// }
```

### Adding State with Reducers

You can add state and reducers together for a complete feature module. Reducers are functions that take the current state and the new value, then return an updated state. They only need to focus on the specific portion of the state related to their business logic, without requiring knowledge of the entire state, making them modular and easier to maintain.

```javascript
// Add state with its related reducers
RepoState.add(
  {
    counter: { value: 0 },
    notifications: { unread: 0 }
  },
  [
    { path: 'counter.value', type: 'increase', reducer: (state, value) => state + value },
    { path: 'counter.value', type: 'reset', reducer: () => 0 },
    { path: 'notifications.unread', type: 'increment', reducer: (state) => state + 1 },
    { path: 'notifications.unread', type: 'clear', reducer: () => 0 }
  ]
);

// Or add reducers separately for existing state
RepoState.addReducer('settings.theme', 'toggle', (state) => (state === 'dark' ? 'light' : 'dark'));
```

### State Conflicts

RepoState prevents accidental state conflicts by throwing errors when you try to overwrite existing values:

```javascript
RepoState.add({ user: { name: 'John' } });
RepoState.add({ user: { name: 'Jane' } }); // ❌ Throws: State conflict detected at path: user.name

// Instead, add non-conflicting properties
RepoState.add({ user: { email: 'jane@example.com' } }); // ✅ Works fine
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

#### Example 1: Modular Feature Development

Here's how you can build features incrementally using the `add` API:

```javascript
// Core app state
RepoState.add({
  app: {
    loading: false,
    version: '1.0.0'
  }
});

// User feature module
RepoState.add(
  {
    user: {
      profile: { name: 'John', email: 'john@example.com' },
      preferences: { theme: 'dark', notifications: true }
    }
  },
  [
    { path: 'user.profile', type: 'update', reducer: (state, updates) => ({ ...state, ...updates }) },
    { path: 'user.preferences.theme', type: 'toggle', reducer: (theme) => theme === 'dark' ? 'light' : 'dark' }
  ]
);

// Shopping cart feature module (loaded separately)
RepoState.add(
  {
    cart: {
      items: [],
      total: 0
    }
  },
  [
    { path: 'cart.items', type: 'add', reducer: (items, newItem) => [...items, newItem] },
    { path: 'cart.items', type: 'remove', reducer: (items, itemId) => items.filter(item => item.id !== itemId) },
    { path: 'cart.total', type: 'calculate', reducer: (_, items) => items.reduce((sum, item) => sum + item.price, 0) }
  ]
);
```

#### Example 2: Using `useRepoState` Hook

The `useRepoState` hook allows you to access and update a specific part of the state by specifying a `statePath`. If the `statePath` is `null`, `undefined`, or `'@'`, the entire state is returned.

```javascript
import { useRepoState } from 'repostate';

const UserProfile = () => {
  const [userProfile, dispatchUserProfile] = useRepoState('user.profile');
  const [theme, dispatchTheme] = useRepoState('user.preferences.theme');

  return (
    <div>
      <p>Name: {userProfile.name}</p>
      <button onClick={() => dispatchUserProfile('update', { name: 'Jane' })}>
        Change Name
      </button>
      <p>Theme: {theme}</p>
      <button onClick={() => dispatchTheme('toggle')}>
        Toggle Theme
      </button>
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

#### Example 3: Using `useRepoDispatch` Hook

The `useRepoDispatch` hook provides a global dispatch function that can be used to update any part of the state. The `dispatch` function takes three arguments: `statePath`, `type`, and `value`.

```javascript
import { useRepoDispatch } from 'repostate';

const ShoppingActions = () => {
  const dispatch = useRepoDispatch();

  const addToCart = (item) => {
    dispatch('cart.items', 'add', item);
    // Recalculate total after adding item
    dispatch('cart.total', 'calculate', getCartItems());
  };

  const toggleTheme = () => {
    dispatch('user.preferences.theme', 'toggle');
  };

  return (
    <div>
      <button onClick={() => addToCart({ id: 1, name: 'Book', price: 10 })}>
        Add to Cart
      </button>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
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

- **`add(state, reducers?)`**: Adds state to the global state tree. Deep merges objects and throws errors on conflicts. Optionally adds reducers for the new state paths.
- **`getSnapshot()`**: Returns a deep clone of the current state.
- **`addReducer(statePath, type, reduceFn)`**: Adds a reducer function for a specific `statePath` and `type`.
- **`initState(state)`**: ⚠️ **Deprecated** - Use `add()` instead. Initializes the global state. Can only be called once.

### `useRepoState(statePath)`

A React hook that provides access to a specific substate and a function to update that substate.

- **`statePath`**: A string representing the path to the desired state. If `statePath` is `null`, `undefined`, or `'@'`, it returns the entire state.

Returns an array `[subState, dispatchFn]`:
- **`subState`**: The current value of the substate at `statePath`.
- **`dispatchFn(type, value)`**: A function to dispatch an action to update the state at the specified `statePath`. If `type` is `null`, the default behavior of directly overwriting the state at the given `statePath` with given `value` is applied.

### `useRepoDispatch()`

A React hook that returns a `dispatch` function for updating the state directly.

- **`dispatch(statePath, type, value)`**: Dispatches an action to update the state at the specified `statePath`. If `type` is `null`, the default behavior of directly overwriting the state at the given `statePath` with given `value` is applied.

## Migration from initState

If you're currently using `initState`, migration to the new `add` API is straightforward:

### Before (deprecated):
```javascript
RepoState.initState({
  user: { name: 'John' },
  settings: { theme: 'dark' }
});

RepoState.addReducer('user', 'update', (state, updates) => ({ ...state, ...updates }));
RepoState.addReducer('settings.theme', 'toggle', (state) => state === 'dark' ? 'light' : 'dark');
```

### After (recommended):
```javascript
RepoState.add(
  {
    user: { name: 'John' },
    settings: { theme: 'dark' }
  },
  [
    { path: 'user', type: 'update', reducer: (state, updates) => ({ ...state, ...updates }) },
    { path: 'settings.theme', type: 'toggle', reducer: (state) => state === 'dark' ? 'light' : 'dark' }
  ]
);
```

### Benefits of Migration:
- ✅ **Modular state management** - Add state incrementally as features load
- ✅ **Better organization** - Group related state and reducers together
- ✅ **Conflict prevention** - Automatic detection of state conflicts
- ✅ **Future-proof** - Built for modern application architectures

## License

This project is licensed under the MIT License.
