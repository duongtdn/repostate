import React from 'react';
import { useRepoState } from 'repostate';

const LeftPanel: React.FC = () => {
  const [stateTree] = useRepoState();
  const [featuresLoaded] = useRepoState<string[]>('app.featuresLoaded');

  const formatStateTree = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);

    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return `[\n${obj.map(item => `${spaces}  ${formatStateTree(item, indent + 1)}`).join(',\n')}\n${spaces}]`;
    }

    return `{\n${Object.entries(obj).map(([key, value]) => {
      const formattedValue = formatStateTree(value, indent + 1);
      return `${spaces}  "${key}": ${typeof formattedValue === 'string' && formattedValue.includes('\n') ? formattedValue : JSON.stringify(formattedValue)}`;
    }).join(',\n')}\n${spaces}}`;
  };

  return (
    <div className="p-4 bg-gray-100 border-r w-1/4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800">State Tree</h3>
        <div className="text-sm text-gray-600 mb-4">
          <div className="mb-2">
            <strong>Dynamic Features:</strong>
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs">Core (always loaded)</span>
            </div>
            {featuresLoaded.includes('cart') && (
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span className="text-xs">Shopping Cart</span>
              </div>
            )}
            {featuresLoaded.includes('notifications') && (
              <div className="flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                <span className="text-xs">Notifications</span>
              </div>
            )}
            {featuresLoaded.includes('settings') && (
              <div className="flex items-center">
                <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                <span className="text-xs">Settings</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded shadow-sm">
        <div className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
          {formatStateTree(stateTree)}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
        <div className="font-semibold text-blue-800 mb-2">Live Updates</div>
        <div className="text-blue-700">
          Watch how the state tree grows as you load new features dynamically using RepoState.add()!
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;