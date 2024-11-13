export function onDOMChange(
  element: Element,
  cb: MutationCallback,
  params: MutationObserverInit = { childList: true }
): () => void {
  const observer = new MutationObserver(cb);
  observer.observe(element, params);
  return () => observer.disconnect();
}
