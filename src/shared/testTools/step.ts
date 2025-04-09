export function step<T>(text: string, callback: () => T): T {
  const result = callback();
  return result;
}
