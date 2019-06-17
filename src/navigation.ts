// This is almost entirely from @reach/router's in-memory / native routing model:
// https://github.com/reach/router/blob/master/src/lib/history.js

export type Listener = (location: Location) => void;
export type Navigate = (to: string, from: string, state?: Object) => void;
export type Back = (amount: number) => void;

export interface Location {
  path: string;
  state: Object;
}

export interface Navigation {
  current: Location;
  navigate: Navigate;
  listen: (listener: Listener) => () => void;
  back: Back;
}

function createNavigation(initial = '/'): Navigation {
  let paths: string[] = [initial];
  let states: Object[] = [];

  let index = 0;
  let listeners: Listener[] = [];

  return {
    get current() {
      return {
        path: paths[index],
        state: states[index],
      };
    },

    navigate: function(
      to: string,
      from: string,
      state?: Object
      // options?: { latest?: boolean }
    ) {
      let next = resolve(to, from);

      if (next === paths[index]) {
        return;
      }

      index++;

      // if (options && options.latest) {
      //   if (history.includes(next)) {
      //     for (let i = history.length - 1; i >= 0; i--) {
      //       if (history[i].includes(next)) {
      //         next = history[i].pathname;
      //         break;
      //       }
      //     }
      //   }
      // }

      if (!state) {
        state = {};
      }

      paths[index] = next;
      states[index] = state;

      const location = {
        path: paths[index],
        state: states[index],
      };

      listeners.forEach(l => l(location));
    },

    listen: function(listener) {
      listeners.push(listener);

      return function() {
        listeners.filter(l => l !== listener);
      };
    },

    back: function(amount: number) {
      const offset = index - amount;
      const next = paths[offset];

      if (next) {
        index = offset;

        const location = {
          path: paths[index],
          state: states[index],
        };

        listeners.forEach(l => l(location));
      }
    },
  };
}

// The following util functions were taken from the @reach/router library:
// https://github.com/reach/router/blob/master/src/lib/utils.js

function resolve(to: string, base: string): string {
  if (startsWith(to, '/')) {
    return to;
  }

  let [toPathname, toQuery] = to.split('?');
  let [basePathname] = base.split('?');

  let toSegments = segmentize(toPathname);
  let baseSegments = segmentize(basePathname);

  if (toSegments[0] === '') {
    return basePathname;
  }

  if (!startsWith(toSegments[0], '.')) {
    let pathname = baseSegments.concat(toSegments).join('/');
    return (basePathname === '/' ? '' : '/') + pathname;
  }

  let allSegments = baseSegments.concat(toSegments);
  let segments = [];
  for (let i = 0, l = allSegments.length; i < l; i++) {
    let segment = allSegments[i];
    if (segment === '..') segments.pop();
    else if (segment !== '.') segments.push(segment);
  }

  return addQuery('/' + segments.join('/'), toQuery);
}

function startsWith(string: string, search: string): boolean {
  return string.substr(0, search.length) === search;
}

function segmentize(uri: string): string[] {
  // strip starting/ending slashes
  return uri.replace(/(^\/+|\/+$)/g, '').split('/');
}

function addQuery(pathname: string, query?: string) {
  return pathname + (query ? `?${query}` : '');
}

export { createNavigation };
