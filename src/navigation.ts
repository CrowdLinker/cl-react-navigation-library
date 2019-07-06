// This is almost entirely from @reach/router's in-memory / native routing model:
// https://github.com/reach/router/blob/master/src/lib/history.js

export type Listener = (location: Location) => void;
export type Navigate = (
  to: string,
  from: string,
  state?: Object,
  options?: NavigateOptions
) => void;
export type Back = (amount: number) => void;
export type NavigateOptions = {
  latest?: boolean;
};

export interface Location {
  path: string;
  state: Object;
}

export interface Navigation {
  current: Location;
  navigate: Navigate;
  listen: (listener: Listener) => () => void;
  back: Back;
  index: number;
}

function createNavigation(initial = '/'): Navigation {
  let paths: string[] = [initial];
  let states: Object[] = [{}];

  let index = 0;
  let listeners: Listener[] = [];

  return {
    get index() {
      return index;
    },

    get current() {
      return {
        path: paths[index],
        state: states[index],
      };
    },

    navigate: function(
      to: string,
      from: string,
      state?: Object,
      options?: { latest?: boolean }
    ) {
      const path = paths[index];
      let next = resolve(to, from, path);

      if (next === path) {
        return;
      }

      index++;

      if (options && options.latest) {
        if (paths.includes(next)) {
          for (let i = paths.length - 1; i >= 0; i--) {
            const path = paths[i];
            if (path.includes(next)) {
              next = path;
              break;
            }
          }
        }
      }

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

let paramRe = /^:(.+)/;

function resolve(to: string, base: string, location: string): string {
  if (startsWith(to, '/')) {
    return to;
  }

  let [toPathname, toQuery] = to.split('?');
  let [basePathname] = base.split('?');
  let [locationPathname] = location.split('?');

  let toSegments = segmentize(toPathname);
  let baseSegments = segmentize(basePathname);
  let locationSegments = segmentize(locationPathname);

  if (toSegments[0] === '') {
    return basePathname;
  }

  if (!startsWith(toSegments[0], '.')) {
    let segments: string[] = [];
    let pathname = baseSegments.concat(toSegments).join('/');
    let pathSegments = segmentize(pathname);

    for (let i = 0; i < pathSegments.length; i++) {
      let segment = pathSegments[i];

      const isDynamic = paramRe.exec(segment);
      if (isDynamic) {
        segment = locationSegments[i];
      }

      segments.push(segment);
    }

    return addQuery(
      (basePathname === '/' ? '' : '/') + segments.join('/'),
      toQuery
    );
  }

  let allSegments = baseSegments.concat(toSegments);
  let segments: string[] = [];

  let offset = 0;

  for (let i = 0, l = allSegments.length; i < l; i++) {
    let segment = allSegments[i];
    if (segment === '..') {
      // accounts for location index vs what we're popping off the path
      offset += 2;
      segments.pop();
    } else if (segment !== '.') {
      const isDynamic = paramRe.exec(segment);
      if (isDynamic) {
        segment = locationSegments[i - offset];
        // reset in case theres another pop
        offset = 0;
      }

      segments.push(segment);
    }
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

export { createNavigation, resolve };
