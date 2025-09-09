````markdown
# RepoState Example - Book Management App

This example demonstrates the new `RepoState.add()` API for modular state management. The app showcases how to:

- Add state incrementally using `RepoState.add()`
- Include reducers when adding state
- Build a modular application where different features can be added independently

## Key Features Demonstrated

1. **Modular State Addition**: User state and books state are added as separate modules
2. **Reducers Integration**: Each state module includes its own reducers
3. **State Interaction**: Books can be moved between the main collection and user's borrowed books

## To run example:

```
npm start
```

## Code Structure

- `Main.jsx` - Shows how to use `RepoState.add()` with state modules and reducers
- `LeftPanel.jsx` - Displays available books using `useRepoState`
- `RightPanel.jsx` - Shows borrowed books and user info using `useRepoState`

This pattern is perfect for:
- Micro-frontend architectures
- Lazy-loaded application features
- Plugin-based systems
- Modular application development

````
