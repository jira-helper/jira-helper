/**
 * function allows to wrap part of the test in a step, which simplifies reading the tests
 * @example
 * ```ts
 * it('should do something', () => {
 *   step('Given: I am on the home page', () => {
 *     // ...
 *   });
 *   step('When: I click on the button', () => {
 *     // ...
 *   });
 *   step('Then: I see the result', () => {
 *     // ...
 *   });
 * });
 * ```
 */
export function step<T>(text: string, callback: () => T): T {
  // eslint-disable-next-line no-console
  console.log(`Step: ${text}`);
  const result = callback();
  return result;
}
