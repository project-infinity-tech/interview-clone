import { useMemo, useSyncExternalStore } from 'react';

const URL_CHANGED_EVENT = 'urlchange';

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(URL_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(URL_CHANGED_EVENT, onChange);
  };
};

const getSearch = () => window.location.search;

type NextParams = URLSearchParams | ((previous: URLSearchParams) => URLSearchParams);

/** Reads and writes the `?query` part of the URL. Works like react-router's hook of the same name. */
export const useSearchParams = (): [
  URLSearchParams,
  (next: NextParams, options?: { replace?: boolean }) => void,
] => {
  const search = useSyncExternalStore(subscribe, getSearch);
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams = (next: NextParams, options?: { replace?: boolean }) => {
    const params = typeof next === 'function' ? next(new URLSearchParams(window.location.search)) : next;
    const query = params.toString();
    const url = `${window.location.pathname}${query === '' ? '' : `?${query}`}${window.location.hash}`;
    if (options?.replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
    window.dispatchEvent(new Event(URL_CHANGED_EVENT));
  };

  return [searchParams, setSearchParams];
};
