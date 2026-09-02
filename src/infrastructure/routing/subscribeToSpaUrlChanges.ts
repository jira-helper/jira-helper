type HistoryMethod = 'pushState' | 'replaceState';

export function subscribeToSpaUrlChanges(onChange: (href: string) => void): () => void {
  let lastHref = window.location.href;

  const notify = () => {
    const { href } = window.location;
    if (href === lastHref) {
      return;
    }
    lastHref = href;
    onChange(href);
  };

  const wrap = (method: HistoryMethod) => {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<History['pushState']>) {
      const result = original.apply(this, args);
      notify();
      return result;
    };
    return () => {
      history[method] = original;
    };
  };

  window.addEventListener('popstate', notify);
  const unwrapPush = wrap('pushState');
  const unwrapReplace = wrap('replaceState');

  return () => {
    window.removeEventListener('popstate', notify);
    unwrapPush();
    unwrapReplace();
  };
}
