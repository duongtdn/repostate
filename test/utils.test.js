import { deepClone } from 'utils';

describe('deepClone function', () => {

  test('should deep clone the entire object', () => {
    const obj = {
      root: {
        trunk: {
          branch: ['leaf']
        },
        other: { foo: 'bar' }
      }
    };

    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
    expect(clonedObj.root.trunk).not.toBe(obj.root.trunk);
  });

  test('should deep clone an array correctly', () => {
    const arrayObj = [1, { foo: 'bar' }, [3, 4]];

    const clonedArray = deepClone(arrayObj);
    expect(clonedArray).toEqual(arrayObj);
    expect(clonedArray).not.toBe(arrayObj);
    expect(clonedArray[1]).not.toBe(arrayObj[1]);
    expect(clonedArray[2]).not.toBe(arrayObj[2]);
  });

  test('should deep clone from a specified path', () => {
    const obj = {
      root: {
        trunk: {
          branch: ['leaf']
        },
        other: { foo: 'bar' }
      }
    };

    const clonedTrunk = deepClone(obj, 'root.trunk');
    expect(clonedTrunk).toEqual({
      branch: ['leaf']
    });
    expect(clonedTrunk).not.toBe(obj.root.trunk);
  });

  test('should deep clone from a nested path', () => {
    const obj = {
      root: {
        trunk: {
          branch: {
            leaf: 'green'
          }
        }
      }
    };

    const clonedBranch = deepClone(obj, 'root.trunk.branch');
    expect(clonedBranch).toEqual({
      leaf: 'green'
    });
    expect(clonedBranch).not.toBe(obj.root.trunk.branch);
  });

  test('should return the same value for non-object inputs (numbers, strings, etc.)', () => {
    const num = 42;
    const str = 'hello';
    const bool = true;

    expect(deepClone(num)).toBe(num);
    expect(deepClone(str)).toBe(str);
    expect(deepClone(bool)).toBe(bool);
  });

  test('should throw an error for non-existent path', () => {
    const obj = {
      root: {
        trunk: {
          branch: ['leaf']
        }
      }
    };

    expect(() => {
      deepClone(obj, 'root.nonExistent');
    }).toThrowError('Invalid path: root.nonExistent');
  });

  test('should throw an error for a partially valid path', () => {
    const obj = {
      root: {
        trunk: {
          branch: ['leaf']
        }
      }
    };

    expect(() => {
      deepClone(obj, 'root.trunk.invalid');
    }).toThrowError('Invalid path: root.trunk.invalid');
  });

  test('should handle null or undefined object inputs', () => {
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

});
