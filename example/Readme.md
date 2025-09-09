````markdown
# RepoState Example - Dynamic State Management Demo

This example demonstrates the powerful `RepoState.add()` API for modular and dynamic state management. The app showcases how to:

- Add state incrementally using `RepoState.add()`
- Include reducers when adding state
- Build features that can be loaded dynamically at runtime
- Create modular applications where different features exist independently
- Prevent state conflicts with automatic detection

## Key Features Demonstrated

### Core Features (Always Loaded)
1. **User Management**: Core user profile with contact information
2. **Book Library**: Basic book borrowing system
3. **App State**: Track loaded features and application metadata

### Dynamic Features (Load on Demand)
1. **Shopping Cart**: Add/remove items with automatic total calculation
2. **Notifications**: Message system with unread count tracking
3. **Settings**: Theme toggling and configuration management
4. **Counter**: Increment/decrement operations with history tracking
5. **Todo List**: Complete todo management with filtering
6. **Custom Features**: Create your own features with custom names

### Advanced Demonstrations
- **State Tree Visualization**: Watch the state grow in real-time
- **Conflict Prevention**: Attempt to load duplicate features
- **Modular Reducers**: Each feature brings its own state logic
- **Feature Composition**: Features can interact and build upon each other

## To run example:

```bash
npm start
```

## Code Structure

- `Main.jsx` - Core app setup with initial state modules
- `LeftPanel.jsx` - Real-time state tree visualization with feature indicators
- `RightPanel.jsx` - Main interface combining all features and demos
- `FeatureLoader.jsx` - Advanced feature loading with predefined and custom options
- `DynamicFeatures.jsx` - Interactive components for dynamically loaded features

## Interactive Demo Flow

1. **Start with Core Features**: See the initial state with user and books
2. **Load Basic Features**: Add shopping cart, notifications, and settings
3. **Try Advanced Features**: Load counter and todo list modules
4. **Create Custom Features**: Build your own feature with a custom name
5. **Watch State Growth**: Observe how the state tree expands in the left panel
6. **Interact with Features**: Use the loaded features to modify state
7. **Explore Conflicts**: Try loading the same feature twice to see conflict prevention

## Use Cases Perfect For This Pattern

- **Micro-frontend Architectures**: Each team can own their state module
- **Lazy-loaded Application Features**: Load features only when needed
- **Plugin-based Systems**: Allow plugins to add their own state
- **Modular Application Development**: Clean separation of concerns
- **Progressive Enhancement**: Start small and add complexity incrementally
- **A/B Testing**: Load different feature sets for different user groups

## Key Benefits Shown

✅ **No State Conflicts**: Automatic detection prevents overwriting existing state
✅ **Modular Development**: Features are completely independent
✅ **Runtime Flexibility**: Load features based on user needs or permissions
✅ **Clean Architecture**: Each feature contains its state and logic together
✅ **Scalable Growth**: State tree grows organically as features are added
✅ **Easy Debugging**: Clear visualization of what's loaded and when

````
