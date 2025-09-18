import React, { useState } from 'react';
import { useRepoState, useRepoDispatch } from 'repostate';

const DynamicFeatures: React.FC = () => {
  const [featuresLoaded] = useRepoState<string[]>('app.featuresLoaded');
  const dispatch = useRepoDispatch();

  return (
    <div className="space-y-6">
      {featuresLoaded.includes('cart') && <ShoppingCartFeature />}
      {featuresLoaded.includes('notifications') && <NotificationsFeature />}
      {featuresLoaded.includes('settings') && <SettingsFeature />}
      {featuresLoaded.includes('counter') && <CounterFeature />}
      {featuresLoaded.includes('todos') && <TodosFeature />}

      {/* Custom Features */}
      {featuresLoaded
        .filter((feature: string) => !['cart', 'notifications', 'settings', 'counter', 'todos'].includes(feature))
        .map((featureName: string) => (
          <CustomFeature key={featureName} featureName={featureName} />
        ))}
    </div>
  );
};

const ShoppingCartFeature: React.FC = () => {
  const [cart] = useRepoState('cart');
  const dispatch = useRepoDispatch();
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const addItem = () => {
    if (newItemName && newItemPrice) {
      const item = {
        name: newItemName,
        price: parseFloat(newItemPrice),
        quantity: 1
      };
      dispatch('cart.items', 'add', item);
      dispatch('cart.total', 'calculate', cart.items);
      setNewItemName('');
      setNewItemPrice('');
    }
  };

  const removeItem = (itemId: number) => {
    dispatch('cart.items', 'remove', itemId);
    const updatedItems = cart.items.filter((item: any) => item.id !== itemId);
    dispatch('cart.total', 'calculate', updatedItems);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    dispatch('cart.items', 'updateQuantity', { id: itemId, quantity });
    dispatch('cart.total', 'calculate', cart.items);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
        <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
        Shopping Cart
      </h3>

      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
            className="flex-1 px-3 py-1 border border-orange-300 rounded"
          />
          <input
            type="number"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            placeholder="Price"
            className="w-20 px-3 py-1 border border-orange-300 rounded"
          />
          <button
            onClick={addItem}
            className="px-4 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {cart.items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-600">${item.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                min="1"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-orange-200">
        <div className="text-lg font-semibold text-orange-800">
          Total: ${cart.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const NotificationsFeature: React.FC = () => {
  const [notifications] = useRepoState('notifications');
  const dispatch = useRepoDispatch();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const addNotification = () => {
    if (newMessage) {
      dispatch('notifications.messages', 'add', {
        text: newMessage,
        type: messageType
      });
      dispatch('notifications.unread', 'increment');
      setNewMessage('');
    }
  };

  const clearNotifications = () => {
    dispatch('notifications.messages', 'clear');
    dispatch('notifications.unread', 'reset');
  };

  const typeColors: Record<string, string> = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
        <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
        Notifications {notifications.unread > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{notifications.unread}</span>}
      </h3>

      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Notification message"
            className="flex-1 px-3 py-1 border border-purple-300 rounded"
          />
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as typeof messageType)}
            className="px-3 py-1 border border-purple-300 rounded"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={addNotification}
            className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Add
          </button>
        </div>
        {notifications.messages.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notifications.messages.map((message: any) => (
          <div key={message.id} className={`bg-${typeColors[message.type]}-100 border border-${typeColors[message.type]}-200 p-2 rounded`}>
            <div className="flex justify-between items-start">
              <span className="font-medium">{message.text}</span>
              <span className="text-xs text-gray-600">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsFeature: React.FC = () => {
  const [settings] = useRepoState('settings');
  const dispatch = useRepoDispatch();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
        Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Theme</span>
          <button
            onClick={() => dispatch('settings.theme', 'toggle')}
            className={`px-3 py-1 rounded ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
          >
            {settings.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Auto Save</span>
          <button
            onClick={() => dispatch('settings', 'update', { autoSave: !settings.autoSave })}
            className={`px-3 py-1 rounded ${settings.autoSave ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            {settings.autoSave ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Notifications</span>
          <button
            onClick={() => dispatch('settings', 'update', { notifications: !settings.notifications })}
            className={`px-3 py-1 rounded ${settings.notifications ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            {settings.notifications ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CounterFeature: React.FC = () => {
  const [counter] = useRepoState('counter');
  const dispatch = useRepoDispatch();

  const increment = (amount = 1) => {
    dispatch('counter.value', 'increment', amount);
    dispatch('counter.history', 'add', { action: `+${amount}`, value: counter.value + amount });
  };

  const decrement = (amount = 1) => {
    dispatch('counter.value', 'decrement', amount);
    dispatch('counter.history', 'add', { action: `-${amount}`, value: Math.max(0, counter.value - amount) });
  };

  const reset = () => {
    dispatch('counter.value', 'reset');
    dispatch('counter.history', 'add', { action: 'reset', value: 0 });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
        Counter
      </h3>

      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-blue-800 mb-3">{counter.value}</div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => decrement(1)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            -1
          </button>
          <button
            onClick={() => decrement(5)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            -5
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            onClick={() => increment(5)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            +5
          </button>
          <button
            onClick={() => increment(1)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            +1
          </button>
        </div>
      </div>

      {counter.history.length > 0 && (
        <div>
          <h4 className="font-medium text-blue-700 mb-2">History</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {counter.history.slice(-5).map((entry: any, index: number) => (
              <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                <span>{entry.action}</span>
                <span className="text-gray-600">{entry.timestamp}</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TodosFeature: React.FC = () => {
  const [todos] = useRepoState('todos');
  const dispatch = useRepoDispatch();
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const addTodo = () => {
    if (newTodoText) {
      dispatch('todos.items', 'add', {
        text: newTodoText,
        priority: newTodoPriority
      });
      setNewTodoText('');
    }
  };

  const toggleTodo = (todoId: number) => {
    dispatch('todos.items', 'toggle', todoId);
  };

  const removeTodo = (todoId: number) => {
    dispatch('todos.items', 'remove', todoId);
  };

  const setFilter = (filter: 'all' | 'active' | 'completed') => {
    dispatch('todos.filter', 'set', filter);
  };

  const filteredTodos = todos.items.filter((todo: any) => {
    if (todos.filter === 'active') return !todo.completed;
    if (todos.filter === 'completed') return todo.completed;
    return true;
  });

  const priorityColors: Record<string, string> = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
        Todo List
      </h3>

      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-1 border border-green-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value as typeof newTodoPriority)}
            className="px-3 py-1 border border-green-300 rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={addTodo}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilter(filter)}
              className={`px-3 py-1 rounded text-sm ${
                todos.filter === filter
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredTodos.map((todo: any) => (
          <div key={todo.id} className="flex items-center gap-2 bg-white p-2 rounded border">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.text}
            </span>
            <span className={`px-2 py-1 text-xs rounded bg-${priorityColors[todo.priority]}-100 text-${priorityColors[todo.priority]}-700`}>
              {todo.priority}
            </span>
            <button
              onClick={() => removeTodo(todo.id)}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomFeature: React.FC<{ featureName: string }> = ({ featureName }) => {
  const [feature] = useRepoState(featureName);
  const dispatch = useRepoDispatch();

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
        <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
        Custom: {featureName}
      </h3>

      <div className="space-y-3">
        <div className="bg-white p-3 rounded border">
          <pre className="text-sm text-gray-700">{JSON.stringify(feature, null, 2)}</pre>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => dispatch(`${featureName}.count`, 'increment')}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Increment Count
          </button>
          <button
            onClick={() => dispatch(`${featureName}`, 'update', {
              enabled: !feature.enabled,
              lastModified: new Date().toLocaleTimeString()
            })}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Toggle & Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicFeatures;