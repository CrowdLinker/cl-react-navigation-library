# react-navigation-library

this library aims to reduce the amount of overhead in setting up your app's navigation. at its core it manages how screens become focused, and provides little to no opinions about what or how you render your components. the API is component driven, meaning screens are focused dynamically, no static magic. it also supports many of the routing APIs found in `@reach/router`, and some of the core ideas/components of `react-navigation`

# features

## routing

having routing at the core of your app architecture has a lot of benefits. deep links are a lot easier to set up, navigating to specific screens while developing is a breeze, and your markup is simpler to follow.

this library ships with a `<Link />` component that is similar to @reach/router. it supports relative and absolute paths, so you can link to any part of your app from anywhere. additionally, each navigator provides relative routing to its children, and so your subnavigators can operate independently and in isolation.

this library also ships with a url bar that can be used to navigate to different parts of your application quickly while developing

## components

every navigator and screen you'll set up is a component and so it follows the same rules as any other react component tree out there, meaning passing props and state is entirely your concern. additionally, you have full control over how screens are mounted and unmounted via `lazy` and `unmountOnExit` flags, and therefore can control any sub navigator trees as well.

## gestures

panning and swiping behaviours are an important part of any native app, so these are provided to you out of the box. they can be configured to your app's needs or turned off completely. this library uses `react-native-gesture-handler` and `react-native-reanimated` in hopes of improving performance over the core animated / pan gesture APIs in react-native.

# example

```
import React from 'react'
import { Navigator, Tabs, Link } from 'react-navigation-library'
import { Signup, Login } from './forms'
import { Feeds } from './feeds'

function Entry() {
  return (
    <Navigator routes={[ 'signup', '/', 'login' ]}>
      <Tabs>
        <Signup />
        <SelectionScreen />
        <Login />
      </Tabs>
    </Navigator>
  )
}

function SelectionScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Link to='signup'>
        <Text>Signup</Text>
      </Link>

      <Link to='login'>
        <Text>Login</Text>
      </Link>
    </View>
  )
}

function App() {
  return (
    <Navigator routes={[ 'entry',  'feeds' ]} initialPath='/entry'>
      <Tabs>
        <Entry unmountOnExit />
        <Feeds />
      </Tabs>
    </Navigator>
  )
}

export default App
```
