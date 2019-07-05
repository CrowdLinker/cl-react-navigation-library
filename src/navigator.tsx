import React, { Component, createContext, Children, cloneElement } from 'react';
import { BasepathContext, NavigationProvider } from './navigation-provider';
import { Navigation } from './navigation';
import { Screen } from './screen';

const NOOP = () => {};

export interface NavigatorState {
  index: number;
  onChange: (nextIndex: number) => void;
  state: Object;
  setNavigatorState: (nextState: Object) => void;
  renderScreens: (
    isScreenActive: (childIndex: number, childElement: any) => boolean,
    children: any
  ) => any;
}

export const NavigatorContext = createContext<NavigatorState>({
  index: 0,
  onChange: NOOP,
  state: {},
  setNavigatorState: NOOP,
  renderScreens: NOOP,
});

type NavigateFn = (to: string, state: Object, basepath?: string) => void;

export const NavigateContext = createContext<NavigateFn>(NOOP);

interface NavigatorProps {
  children: any;
  basepath: string;
  location: string;
  navigation: Navigation;
  initialState: Object;
}

class NavigatorImpl extends Component<NavigatorProps> {
  routes: string[] = [];

  handleChange = (nextIndex: number) => {
    const {
      basepath,
      navigation: {
        navigate,
        current: { path },
      },
    } = this.props;

    const { index } = this.state;

    // is not focused so we shouldnt push this view
    if (index !== -1 && index !== nextIndex) {
      const next = this.routes[nextIndex];

      if (next) {
        const pathname = getPathname(next, basepath);
        const nextPath = resolve(pathname, path);

        navigate(nextPath, path);
      }
    }
  };

  getActiveIndex = () => {
    const { basepath, location } = this.props;

    let activeIndex = -1;

    for (let i = 0; i < this.routes.length; i++) {
      const pathname = getPathname(this.routes[i], basepath);
      const isMatch = match(pathname, location);

      if (isMatch) {
        activeIndex = i;
      }
    }

    return activeIndex;
  };

  setNavigatorState = (newState: Object) => {
    this.setState((state: NavigatorState) => {
      return {
        ...state,
        state: {
          ...state.state,
          ...newState,
        },
      };
    });
  };

  navigate = (to: string, state: Object, basepath?: string) => {
    const {
      location,
      basepath: navigatorBasepath,
      navigation: { navigate },
    } = this.props;

    const query = getQuery(location);

    this.setNavigatorState({ ...state, query });
    navigate(to, basepath || navigatorBasepath);
  };

  renderScreens = (
    isScreenActive: (childIndex: number, childElement: any) => boolean,
    children: any
  ) => {
    const { basepath, location } = this.props;

    const routes = Children.map(children, element => element.props.path || '/');

    if (routes.length !== this.routes.length) {
      this.routes = routes;
    }

    return Children.map(children, (element: any, index: number) => {
      const path = routes[index];
      const pathname = getPathname(path || '/', basepath);
      const active = isScreenActive(index, element);
      const params = getParams(pathname, location);

      return (
        <BasepathContext.Provider value={pathname}>
          <Screen active={active}>{cloneElement(element, params)}</Screen>
        </BasepathContext.Provider>
      );
    });
  };

  static defaultProps = {
    initialState: {},
  };

  state = {
    index: -1,
    onChange: this.handleChange,
    state: this.props.initialState,
    setNavigatorState: this.setNavigatorState,
    renderScreens: this.renderScreens,
  };

  componentDidUpdate(prevProps: NavigatorProps) {
    if (prevProps.location !== this.props.location) {
      const index = this.getActiveIndex();

      if (index !== this.state.index) {
        this.setState({ index });
      }
    }
  }

  render() {
    const { children, location, navigation } = this.props;

    return (
      <NavigateContext.Provider value={this.navigate}>
        <NavigatorContext.Provider value={this.state}>
          {typeof children === 'function'
            ? children({
                index: this.state.index,
                state: this.state.state,
                navigate: this.navigate,
                back: navigation.back,
                location,
              })
            : children}
        </NavigatorContext.Provider>
      </NavigateContext.Provider>
    );
  }
}

function Navigator({
  children,
  initialState,
  ...rest
}: {
  initialState?: Object;
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
              initialState={initialState}
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

function getParams(
  pathname: string,
  location: string
): { [param: string]: string } | undefined {
  let params: { [param: string]: string } | undefined;

  const pathSegments = pathname.split('/');
  const locationSegments = location.split('/');

  for (let i = 0; i < pathSegments.length; i++) {
    const paramsMatch = paramRe.exec(pathSegments[i]);
    if (paramsMatch) {
      if (!params) {
        params = {};
      }

      params[paramsMatch[1]] = locationSegments[i];
    }
  }

  return params;
}

function getQuery(location: string): string {
  const [, query] = location.split('?');
  return query || '';
}
