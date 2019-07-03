import React, { Component, createContext } from 'react';
import { BasepathContext, NavigationProvider } from './navigation-provider';
import { Navigation } from './navigation';

const NOOP = () => {};

export interface NavigatorState {
  activeIndex: number;
  routes: string[];
  handleChange: (nextIndex: number) => void;
  setRoutes: (routes: string[]) => void;
}

export const NavigatorContext = createContext<NavigatorState>({
  activeIndex: 0,
  routes: [],
  handleChange: NOOP,
  setRoutes: NOOP,
});

interface NavigatorProps {
  children: any;
  basepath: string;
  location: string;
  name?: string;
  navigation: Navigation;
}

class NavigatorImpl extends Component<NavigatorProps> {
  handleChange = (nextIndex: number) => {
    const {
      basepath,
      navigation: {
        navigate,
        current: { path },
      },
    } = this.props;

    const { activeIndex, routes } = this.state;

    // is not focused so we shouldnt push this view
    if (activeIndex !== -1 && activeIndex !== nextIndex) {
      const next = routes[nextIndex];

      if (next) {
        const pathname = getPathname(next, basepath);
        const nextPath = resolve(pathname, path);

        navigate(nextPath, path);
      }
    }
  };

  getActiveIndex = (routes: string[]) => {
    const { basepath, location } = this.props;

    let activeIndex = -1;

    for (let i = 0; i < routes.length; i++) {
      const pathname = getPathname(routes[i], basepath);
      const isMatch = match(pathname, location);

      if (isMatch) {
        activeIndex = i;
      }
    }

    return activeIndex;
  };

  setRoutes = (routes: string[]) => {
    this.setState({ routes });
  };

  state = {
    activeIndex: -1,
    handleChange: this.handleChange,
    routes: [],
    setRoutes: this.setRoutes,
  };

  componentDidUpdate(prevProps: NavigatorProps, prevState: NavigatorState) {
    if (prevProps.location !== this.props.location) {
      const activeIndex = this.getActiveIndex(this.state.routes);

      if (activeIndex !== this.state.activeIndex) {
        this.setState({ activeIndex });
      }
    }

    if (prevState.routes.length !== this.state.routes.length) {
      const activeIndex = this.getActiveIndex(this.state.routes);

      if (activeIndex !== this.state.activeIndex) {
        this.setState({ activeIndex });
      }
    }
  }

  render() {
    const { children, navigation, location } = this.props;

    return (
      <NavigatorContext.Provider value={this.state}>
        {typeof children === 'function'
          ? children({
              activeIndex: this.state.activeIndex,
              state: navigation.current.state,
              location,
            })
          : children}
      </NavigatorContext.Provider>
    );
  }
}

function Navigator({
  children,
  name,
  ...rest
}: {
  name?: string;
  initialPath?: string;
  showLocationBar?: boolean;
  children: any;
}) {
  return (
    <BasepathContext.Consumer>
      {(basepath = '/') => (
        <NavigationProvider {...rest}>
          {navigation => (
            <NavigatorImpl
              name={name}
              location={navigation ? navigation.current.path : '/'}
              navigation={navigation}
              basepath={basepath}
            >
              {children}
            </NavigatorImpl>
          )}
        </NavigationProvider>
      )}
    </BasepathContext.Consumer>
  );
}

export { Navigator };

export function getPathname(path: string, basepath: string): string {
  if (path === '/' || path === '') {
    return basepath;
  }

  return `${basepath === '/' ? '' : basepath}/${path}`;
}

let paramRe = /^:(.+)/;

function resolve(pathname: string, location: string): string {
  let l = location;

  if (location.includes('?')) {
    l = location.split('?')[0];
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const locationSegments = l.split('/').filter(Boolean);

  let segments: string[] = [];

  for (let i = 0; i < pathSegments.length; i++) {
    let subpath = pathSegments[i];
    const isDynamic = paramRe.exec(subpath);

    if (isDynamic) {
      subpath = locationSegments[i];
    }

    segments.push(subpath);
  }

  return '/' + segments.join('/');
}

function match(pathname: string, location: string): boolean {
  // if (exact && pathSegments.length !== locationSegments.length) {
  //   return false;
  // }

  if (pathname === '/') {
    return true;
  }

  let l = location;

  if (location.includes('?')) {
    l = location.split('?')[0];
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const locationSegments = l.split('/').filter(Boolean);

  if (pathSegments.length > locationSegments.length) {
    return false;
  }

  let match = true;

  for (let i = 0; i < pathSegments.length; i++) {
    const subpath = pathSegments[i];

    const isDynamic = paramRe.exec(subpath);

    if (subpath !== '/') {
      if (!isDynamic && subpath !== locationSegments[i]) {
        match = false;
        break;
      }

      if (isDynamic && locationSegments[i] === '') {
        match = false;
        break;
      }
    }
  }

  return match;
}
