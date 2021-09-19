// immutability utilities

export function set<
  V,
  K extends string | number | symbol,
  T extends Record<K, V>,
>(
  record: T,
  key: K,
  value: V,
) {
  return { ...record, [key]: value } as T; //todo
}

export function setBatch<V, K extends string | number | symbol>(
  record: Record<K, V>,
  changes: Record<K, V>,
) {
  return { ...record, ...changes };
}

export function del<V, K extends string | number | symbol>(
  record: Record<K, V>,
  key: K,
) {
  const newRecord = { ...record };
  delete newRecord[key];
  return newRecord;
}

export function setArray<V>(array: V[], index: number, value: V) {
  const newArray = [...array];
  newArray[index] = value;
  return newArray;
}
