import React, { cloneElement, Children } from 'react';
import { Navigation, createNavigation } from './navigation';
import { View, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import Transition, { NavigatorType } from './transition';
import { LocationBar } from './location-bar';

export const NavigationContext = React.createContext<Navigation | undefined>(
  undefined
);
const BasepathContext = React.createContext('/');

interface NavigationProps {
  initialPath?: string;
  showLocationBar?: boolean;
  children: (navigation: Navigation) => React.ReactNode;
}

class NavigationProviderImpl extends React.Component<
  NavigationProps,
  Navigation
> {
  unlisten: () => void;
  mounted: boolean;

  constructor(props: any) {
    super(props);

    const navigation = createNavigation(props.initialPath);

    this.unlisten = () => {};
    this.mounted = false;

    this.state = navigation;
  }

  componentDidMount() {
    this.mounted = true;

    this.unlisten = this.state.listen(location => {
      if (this.mounted) {
        this.setState({ current: location });
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.unlisten();
  }

  render() {
    const { children, showLocationBar } = this.props;

    return (
      <NavigationContext.Provider value={this.state}>
        {children(this.state)}
        {showLocationBar && (
          <LocationBar
            path={this.state.current.path}
            navigate={this.state.navigate}
            back={this.state.back}
          />
        )}
      </NavigationContext.Provider>
    );
  }
}

function NavigationProvider(props: NavigationProps) {
  return (
    <NavigationContext.Consumer>
      {navigation => {
        if (!navigation) {
          return <NavigationProviderImpl {...props} />;
        }

        return props.children(navigation);
      }}
    </NavigationContext.Consumer>
  );
}

interface NavigatorProps {
  children: any;
  style?: StyleProp<ViewStyle>;
  type?: NavigatorType;
  initialPath?: string;
  showLocationBar?: boolean;
}

export interface RouteProps<P = {}, S = {}> {
  path?: string;
  initial?: boolean;
  unmountOnExit?: boolean;
  query?: string;
  params?: P;
  state?: S;
  children?: any;
}

// map navigation props to routes and parse focus index
class Router extends React.Component<NavigatorProps & RouteProps> {
  render() {
    const { style, children, type, ...rest } = this.props;

    return (
      <BasepathContext.Consumer>
        {(basepath = '/') => (
          <NavigationProvider {...rest}>
            {navigation => {
              // in cases with nested navigators w/ no routes
              // this means we can wrap subrouters in a router to render them on their own
              if (!containsChildRouteComponent(children)) {
                return children;
              }

              const [routes, matchingIndex] = createRoutes(
                children,
                navigation,
                basepath
              );

              return (
                <View style={style || { flex: 1 }}>
                  <Routes matchingIndex={matchingIndex} type={type}>
                    {routes}
                  </Routes>
                </View>
              );
            }}
          </NavigationProvider>
        )}
      </BasepathContext.Consumer>
    );
  }
}

interface RoutesProps {
  type?: NavigatorType;
  matchingIndex: number;
  children: any;
}

interface RoutesState {
  rendered: number[];
}

// wraps children in transition w/ focus index
class Routes extends React.Component<RoutesProps, RoutesState> {
  state = {
    rendered: [this.props.matchingIndex],
  };

  componentDidUpdate(prevProps: RoutesProps) {
    // track the active index so that we can control the active index of transitions
    // this keeps the last rendered position of the last match
    if (
      prevProps.matchingIndex !== this.props.matchingIndex &&
      this.props.matchingIndex !== -1
    ) {
      this.setState(state => {
        return {
          rendered: [
            ...state.rendered.filter(i => i !== this.props.matchingIndex),
            this.props.matchingIndex,
          ],
        };
      });
    }
  }

  render() {
    const { children, matchingIndex, type = 'tabs' } = this.props;
    const { rendered } = this.state;

    const lastMatchingIndex = rendered[rendered.length - 1];

    return Children.map(children, (element: any, index) => {
      const hasRendered = rendered.includes(index);
      const isFocused = index === matchingIndex;
      const isBelowInStack = type === 'stack' && index < matchingIndex;
      const keepAlive = !element.props.unmountOnExit && hasRendered;

      // transition won't unmount components until exit animations finish
      const shouldRenderChild = isFocused || isBelowInStack || keepAlive;
      const activeIndex =
        matchingIndex === -1 ? lastMatchingIndex : matchingIndex;

      return (
        <Transition
          type={type}
          index={index}
          total={children.length}
          activeIndex={activeIndex}
          pathname={element.props.pathname}
          shouldRenderChild={shouldRenderChild}
        >
          <BasepathContext.Provider value={element.props.pathname}>
            {element}
          </BasepathContext.Provider>
        </Transition>
      );
    });
  }
}

interface LinkProps {
  to: string;
  state?: Object;
  children: any;
  style?: StyleProp<ViewStyle>;
}

function Link({ to, state, children, style }: LinkProps) {
  return (
    <NavigationContext.Consumer>
      {navigation => (
        <BasepathContext.Consumer>
          {(basepath = '/') => {
            function navigate() {
              navigation && navigation.navigate(to, basepath, state);
            }

            return (
              <TouchableOpacity onPress={() => navigate()} style={style}>
                {children}
              </TouchableOpacity>
            );
          }}
        </BasepathContext.Consumer>
      )}
    </NavigationContext.Consumer>
  );
}

export { Router, Link };

interface Route extends Navigation {
  pathname: string;
  initial?: boolean;
  params?: Object;
  query: string;
}

// Helpers
function createRoutes(
  children: any,
  navigation: Navigation,
  basepath: string
): [React.ReactElement<Route>[], number] {
  let activeIndex = -1;

  const routes = Children.map(children, (element: any, index: number) => {
    const route = createRoute(element, navigation, basepath);
    let clone;

    if (typeof element.props.children === 'function') {
      clone = element.props.children(route);
    } else {
      clone = cloneElement(element, route);
    }

    if (
      match(route.pathname, navigation.current.path, {
        exact: false,
      })
    ) {
      if (!route.initial) {
        activeIndex = index;
      } else {
        if (activeIndex === -1) {
          activeIndex = index;
        }
      }
    }

    return clone;
  });

  return [routes, activeIndex];
}

function createRoute(
  element: any,
  navigation: Navigation,
  basepath: string
): Route {
  const { path = '' } = element.props;

  const pathname = getPathname(path, basepath);
  const params = getParams(pathname, navigation.current.path);
  const query = getQuery(navigation.current.path);
  const state = navigation.current.state;

  function navigate(to: string, state?: Object) {
    navigation.navigate(to, basepath, state);
  }

  return {
    ...navigation,
    ...state,
    params,
    query,
    pathname,
    navigate,
    initial: element.props.initial,
  };
}

function containsChildRouteComponent(children: any) {
  let hasPath = false;

  Children.forEach(children, (element: any) => {
    if (element.props.initial || element.props.path) {
      hasPath = true;
    }
  });

  return hasPath;
}

function getPathname(path: string, basepath: string): string {
  if (path === '') {
    return basepath;
  }

  return `${basepath === '/' ? '' : basepath}/${path}`;
}

let paramRe = /^:(.+)/;

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
  const [_, query] = location.split('?');
  return query || '';
}

function match(pathname: string, location: string, { exact = false }): boolean {
  let l = location;

  if (location.includes('?')) {
    l = location.split('?')[0];
  }

  const pathSegments = pathname.split('/');
  const locationSegments = l.split('/');

  if (pathSegments.length > locationSegments.length) {
    return false;
  }

  if (exact && pathSegments.length !== locationSegments.length) {
    return false;
  }

  let match = true;

  for (let i = 0; i < pathSegments.length; i++) {
    const subpath = pathSegments[i];

    const isDynamic = paramRe.exec(subpath);

    if (!isDynamic && subpath !== locationSegments[i]) {
      match = false;
      break;
    }

    if (isDynamic && locationSegments[i] === '') {
      match = false;
      break;
    }
  }

  return match;
}
