import type { StateObject } from './types';

export function deepClone(obj: any, path: string | null = null): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // If a path is provided, we need to traverse the object to reach the target path
  if (path) {
    const pathParts = path.split('.');
    let current: any = obj;

    for (const part of pathParts) {
      if (current === undefined || current === null || !Object.prototype.hasOwnProperty.call(current, part)) {
        throw new Error(`Invalid path: ${path}`);
      }
      current = current[part];
    }
    return deepClone(current);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const clonedObj: StateObject = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}