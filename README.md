# react-navigation-library

this library attempts to provide a similar api to @reach/router but with a native focus. the key difference between the two is that your screens are kept alive unless you specify the `unmountOnExit` flag to your screen. this is to maintain UI state that can't (easily) be computed, such as scroll position in a sibling tab view or nested scroll view. some other differences are that it handles transitions out of the box, and has an implementation of location akin to that found in browsers and react-router-native.

having routing at the core of your app architecture has a lot of benefits. deep links are a lot easier to set up, navigating to specific screens while developing is a breeze, and your markup is a lot like what a web app might look like.

its important to be able to render your subrouters in isolation when writing integration testing or styling nested screens. this is great because subrouters are independent of parent navigation architecture. like @reach/router, this library will render the first router in the tree as a provider, and it supports relative navigation paths, so subrouters should behave as expected when renderd in isolation.

there are no opinions about your components, so you can render whatever you like and this library will manage how they are focused. that being said, there are a few default components that are unique to native navigation and to individual platforms. these can be a pain to get consistent, so react-navigation-library ships with some helper containers to wrap around your custom header/tabbar components if you'd like.

this ships with a location bar that can be used as a development tool. it can be enabled by passing the `showLocationBar` flag to any of your routers to make navigation while developing a bit easier.

## Example

a basic navigation example can be found in the `/example` folder

[codesandbox](https://codesandbox.io/s/github/andyboythekid/react-navigation-library/tree/master/example)

```
import { View, Text } from 'react-native';
import { Router, Link, RouteProps } from 'react-navigation-library';

function App() {
  // the order of your routes is important because it determines how they are focused.
  // <Login /> will come into focus from the left and <Signup /> will come into focus from the right

  return (
    <AppContainer>

      <Router showLocationBar initialPath="/signup?referral_code=abc123">

        <Login path="login" unmountOnExit />
        <Entry initialRoute />
        <Signup path="signup" />

      </Router>

    </AppContainer>
  );
}

function AppContainer({ children }: any) {
  return (
    <View
      style={{
        flex:  1,
      }}
    >
      {children}
    </View>
  );
}
```
