"use strict"

export function deepClone(obj, path = null) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // If a path is provided, we need to traverse the object to reach the target path
  if (path) {
    const pathParts = path.split('.');
    let current = obj;

    for (const part of pathParts) {
      if (current === undefined || current === null || !current.hasOwnProperty(part)) {
        throw new Error(`Invalid path: ${path}`);
      }
      current = current[part];
    }
    return deepClone(current);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}

