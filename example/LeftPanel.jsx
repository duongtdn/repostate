"use strict"
import React from 'react';
import { useRepoState} from '../src';

const LeftPanel = () => {
  const [stateTree] = useRepoState();

  return (
    <div className="p-4 bg-gray-100 border-r w-1/4">
      <h3 className="text-xl font-bold mb-4">State Tree</h3>
      <pre>{JSON.stringify(stateTree, null, 2)}</pre>
    </div>
  );
};

export default LeftPanel;
