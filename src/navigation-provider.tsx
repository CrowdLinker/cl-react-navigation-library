import React from 'react';
import { Navigation, createNavigation, NavigateOptions } from './navigation';
import { BackHandler } from 'react-native';
import { LocationBar } from './location-bar';

export const NavigationContext = React.createContext<Navigation | undefined>(
  undefined
);

export const BasepathContext = React.createContext('/');

export interface NavigationProps {
  initialPath?: string;
  showLocationBar?: boolean;
  children: any;
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
        this.setState({ location });
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
    const { navigate, location } = this.state;
    const { initialPath } = this.props;

    if (prevProps.initialPath !== initialPath && initialPath) {
      navigate(initialPath, location);
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
            path={this.state.location}
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

export { NavigationProvider };
