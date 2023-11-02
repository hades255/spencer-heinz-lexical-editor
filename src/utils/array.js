export const compareArraysByKey = (arr1, arr2, key = '_id') => {
  const differences = { A: [], B: [] };

  // Find elements in A that are not in B
  differences.A = arr1.filter((obj1) => !arr2.some((obj2) => obj2[key] === obj1[key]));

  // Find elements in B that are not in A
  differences.B = arr2.filter((obj2) => !arr1.some((obj1) => obj1[key] === obj2[key]));

  return differences;
};
