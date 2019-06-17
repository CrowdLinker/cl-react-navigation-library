# React Native Navigation Library

## What is this?

A(nother) routing library for react-native.

I love using libraries like @reach/router, react-router, and react-navigation, however there are parts from each that I wish the other had, and some parts I wish they didnt. This library attempts to fall somewhere in the middle of these great libraries!

[Codesandbox Example](https://codesandbox.io/s/examples-j0n3q)

## Features

- routing API very similar to reach/router, with a few caveats
- stacks / tabs / switches similar (in behaviour) to react-navigation
- no opinions about what you render, just how it becomes focused
- nice development experience by navigating to any screen via url
- feels more 'component-y' than react-navigation

## Example

```
import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  Button,
} from 'react-native'

import {
  Router,
  Screen,
  Link,
  Headers,
  Header,
  Screens,
  RouteProps,
  StateRoute,
} from 'react-native-navigation-library'

// Router will render matching `Routes` in its `Screens` container
// You can specify an initial path to render in the top level router of your app
// The location bar will only appear in development mode, and is meant to help, but can be hidden

function Example() {
  return (
    <AppContainer>
      <Router hideLocationBar={false}>
        <Headers>
          {/* '*' signifies the default route for this navigator */}
          <Header path="*">
            <MyHeader>
              <Text>Default</Text>
            </MyHeader>
          </Header>

          {/* Routes can match w/ params */}
          <Header path=":title">
            {({ params }: any) => (
              <MyHeader>
                <Text>{params && params.title}</Text>
              </MyHeader>
            )}
          </Header>

          {/* Override previous matches for specific route */}
          <Header path="home">
            <MyHeader>
              <Text>Home screen</Text>
            </MyHeader>
          </Header>
        </Headers>

        {/* Screens can be stack, tabs, or switch */}
        <Screens type="tabs">
          <Screen path="*">
            <Welcome />
          </Screen>

          <Screen path="signup">
            <Signup />
          </Screen>

          <Screen path="home">
            <Home />
          </Screen>
        </Screens>
      </Router>
    </AppContainer>
  )
}

// You can navigate to any screen by url with a `Link` component

function Home() {
  return (
    <View style={styles.container}>
      <Title>Home</Title>
      <Link to="/">
        <Text style={styles.instructions}>Welcome</Text>
      </Link>
    </View>
  )
}

// Links can also navigate by relative paths

function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome!</Text>
      <Link to="../signup">
        <Text style={styles.instructions}>Sign up</Text>
      </Link>
    </View>
  );
}

// You can match routes dynamically with params -- priority is given to the last matching route

function RouteHeader() {
  return (
    <Router>
      <Screens style={{ height: 60 }}>
        <Route path=":title">
          {({ params }: any) => (
            <Title>{capitalizeFirstLetter(params.title)}</Title>
          )}
        </Route>

        <!-- Override the above match for a specific screen -->
        <Route path="signup/onboarding">
          <Title>Onboarding</Title>
        </Route>
      </Screens>
    </Router>
  );
}

// Routes will receive a `navigate` prop to imperatively update location
// e.g navigate('/welcome') or by a relative path navigate('../welcome')

function Signup({ navigate }: StateRoute<{}>) {
  function submitSignup({ email }: { email: string }) {
    // You can pass any state object as a second argument to the navigate() function
    navigate && navigate('/signup/onboarding', { email })
  }

  return (
    <Router>
      <Screens type="tabs">
        <Screen path="*">
          <View style={styles.container}>
            <Text style={styles.welcome}>Signup</Text>

            <Form onPress={submitSignup} />

            <Link to="../">
              <Text style={styles.welcome}>Go back</Text>
            </Link>
          </View>
        </Screen>

        <Screen path="onboarding">
          <Onboarding />
        </Screen>
      </Screens>
    </Router>
  )
}

// Each route will receive an optional state prop where you can access any passed state

function Onboarding({ state }: StateRoute<{ email: string }>) {
  const email = state ? state.email : ''

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>{`Welcome to the app ${email}!`}</Text>
      <Link to="/home">
        <Text>Home</Text>
      </Link>

      <Link to="../">
        <Text>Back</Text>
      </Link>
    </View>
  );
}

// HELPERS

function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.welcome}>{children}</Text>
}

function MyHeader({ children }: any) {
  return (
    <View style={[styles.centered, { backgroundColor: 'white' }]}>
      {children}
    </View>
  )
}

function AppContainer({ children }: any) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  )
}

function Form({ onPress }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View
      style={{
        padding: 10,
        height: 200,
        width: 200,
        justifyContent: 'space-around',
      }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Go" onPress={() => onPress({ email, password })} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'aquamarine',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  tabs: {
    height: 60,
    flexDirection: 'row',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
```

## Notes

- `v0.1.x` and below has been migrated to `react-native-navigation-components`
- this is still a work in progress, there's lots I'd like to have here, and I'm always open to ideas/help
