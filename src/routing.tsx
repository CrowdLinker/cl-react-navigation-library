import React, { cloneElement, Children } from 'react';
import { Navigation, createNavigation, NavigateOptions } from './navigation';
import {
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  BackHandler,
  View,
} from 'react-native';
import PanHandler from './pan-handler';
import Transition, { NavigatorType, TransitionProps } from './transition';
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
  navigation: Navigation;

  constructor(props: any) {
    super(props);

    const navigation = createNavigation(props.initialPath);
    this.navigation = navigation;

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

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.unlisten();
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentDidUpdate(prevProps: NavigationProps) {
    const {
      navigate,
      current: { path },
    } = this.state;
    const { initialPath } = this.props;

    if (prevProps.initialPath !== initialPath && initialPath) {
      navigate(initialPath, path);
    }
  }

  handleBackPress = () => {
    if (this.navigation.index !== 0) {
      this.state.back(1);
      return true;
    }

    return false;
  };

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
  transition?: Partial<TransitionProps>;
  initialPath?: string;
  showLocationBar?: boolean;
  panEnabled?: boolean;
}

export interface RouteProps<P = {}, S = {}> {
  path?: string;
  initialRoute?: boolean;
  unmountOnExit?: boolean;
  query?: string;
  params?: P;
  state?: S;
  children?: any;
}

// map navigation props to routes and parse focus index
class Router extends React.Component<NavigatorProps & RouteProps> {
  render() {
    const {
      style,
      children,
      type = 'tabs',
      transition,
      panEnabled,
      ...rest
    } = this.props;

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
                  <Routes
                    navigation={navigation}
                    matchingIndex={matchingIndex}
                    type={type}
                    transition={transition}
                    state={navigation.current.state}
                    panEnabled={panEnabled}
                  >
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
  state: Object;
  panEnabled?: boolean;
  navigation: Navigation;
  transition?: Partial<TransitionProps>;
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

  handleSwipe = (direction: 'left' | 'right') => {
    const { children: routes, navigation, type } = this.props;

    const activeIndex = this.getActiveIndex();
    const current = routes[activeIndex];

    if (current) {
      if (direction === 'right') {
        const right = routes[activeIndex + 1];

        if (right) {
          navigation.navigate(
            right.props.pathname,
            current.props.pathname,
            {},
            { latest: true }
          );
        }
      }

      if (direction === 'left') {
        const left = routes[activeIndex - 1];

        // only tabs should swipe left w/ latest route
        // stack will just find the same route its already on
        if (left) {
          navigation.navigate(
            left.props.pathname,
            current.props.pathname,
            {},
            { latest: type === 'tabs' }
          );
        }
      }
    }
  };

  getActiveIndex = () => {
    const { rendered } = this.state;
    const { matchingIndex } = this.props;

    const lastMatchingIndex = rendered[rendered.length - 1];
    const activeIndex =
      matchingIndex === -1 ? lastMatchingIndex : matchingIndex;

    return activeIndex;
  };

  render() {
    const {
      children,
      matchingIndex,
      type = 'tabs',
      transition,
      state,
      panEnabled = false,
    } = this.props;
    const { rendered } = this.state;

    const activeIndex = this.getActiveIndex();

    const isFirstStackScreen = type === 'stack' && activeIndex === 0;

    return (
      <PanHandler
        transition={this.handleSwipe}
        enabled={panEnabled ? !isFirstStackScreen : false}
      >
        {({ panValue, transitioning }: any) =>
          Children.map(children, (element: any, index) => {
            const hasRendered = rendered.includes(index);
            const isFocused = index === matchingIndex;
            const isBelowInStack = type === 'stack' && index < matchingIndex;
            const keepAlive = !element.props.unmountOnExit && hasRendered;
            const isAdjacentInPan =
              type === 'tabs' &&
              panEnabled &&
              Math.abs(index - activeIndex) === 1 &&
              hasRendered;

            // transition won't unmount components until exit animations finish
            const shouldRenderChild =
              isFocused || isBelowInStack || keepAlive || isAdjacentInPan;

            return (
              <Transition
                type={type}
                index={index}
                total={children.length}
                activeIndex={activeIndex}
                pathname={element.props.pathname}
                shouldRenderChild={shouldRenderChild}
                state={state}
                panValue={panValue}
                panning={transitioning}
                {...transition}
              >
                <BasepathContext.Provider value={element.props.pathname}>
                  {!hasRendered && !shouldRenderChild ? null : (
                    <CacheState focused={index === activeIndex} state={state}>
                      {element}
                    </CacheState>
                  )}
                </BasepathContext.Provider>
              </Transition>
            );
          })
        }
      </PanHandler>
    );
  }
}

interface CacheStateProps {
  children: React.ReactElement<any>;
  state: Object;
  focused: boolean;
}

class CacheState extends React.Component<CacheStateProps> {
  state = this.props.state;

  componentDidUpdate(prevProps: CacheStateProps) {
    if (!prevProps.focused && this.props.focused) {
      this.setState(this.props.state);
    }
  }

  render() {
    const { children, focused } = this.props;
    return cloneElement(children, { ...this.state, focused });
  }
}

interface LinkProps {
  to: string;
  state?: Object;
  children: any;
  style?: StyleProp<ViewStyle>;
  options?: NavigateOptions;
  component?: any;
}

function Link({ to, state, children, style, options }: LinkProps) {
  return (
    <NavigationContext.Consumer>
      {navigation => (
        <BasepathContext.Consumer>
          {(basepath = '/') => {
            function navigate() {
              // this might help with performance -- not sure
              requestAnimationFrame(() => {
                navigation && navigation.navigate(to, basepath, state, options);
              });
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

// interface ParamsProps {
//   path: string;
//   children: ({ params }: { params?: any }) => React.ReactNode;
// }

// function Params({ path, children }: ParamsProps) {
//   return (
//     <NavigationProvider>
//       {navigation => (
//         <BasepathContext.Consumer>
//           {basepath => {
//             const pathname = getPathname(path, basepath);
//             const params = getParams(pathname, navigation.current.path);

//             return children({ params });
//           }}
//         </BasepathContext.Consumer>
//       )}
//     </NavigationProvider>
//   );
// }

interface MatchProps {
  path: string;
  children: (props: { match: boolean; params?: any }) => any;
  exact?: boolean;
}

function Route({ path, children, exact }: MatchProps) {
  return (
    <NavigationProvider>
      {navigation => (
        <BasepathContext.Consumer>
          {basepath => {
            const pathname = getPathname(path, basepath);
            const params = getParams(pathname, navigation.current.path);

            return children({
              params,
              match: match(pathname, navigation.current.path, { exact }),
            });
          }}
        </BasepathContext.Consumer>
      )}
    </NavigationProvider>
  );
}

export { Router, Link, Route };

interface Route extends Navigation {
  pathname: string;
  initialRoute?: boolean;
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

    if (match(route.pathname, navigation.current.path, { exact: false })) {
      if (!route.initialRoute) {
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
    initialRoute: element.props.initialRoute,
  };
}

function containsChildRouteComponent(children: any) {
  let hasPath = false;

  Children.forEach(children, (element: any) => {
    if (element.props.initialRoute || element.props.path) {
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
  const [, query] = location.split('?');
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

  if (pathname === '/') {
    return true;
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
