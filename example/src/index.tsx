// app entry
import React from 'react';
import { AppRegistry, Platform, View, Text } from 'react-native';
import { Router, Link, RouteProps } from '../../src/index';

function App() {
  return (
    <AppContainer>
      <Router type="tabs" showLocationBar initialPath="/signup?test=value">
        <Login path="login" />
        <MyScreen initial title="Home">
          <MyLink to="login">Login</MyLink>
          <MyLink to="signup">Signup</MyLink>
        </MyScreen>
        <Signup path="signup" />
        <MyScreen path="app" title="Welcome to the app!" />
      </Router>
    </AppContainer>
  );
}

type Param = {
  id: string;
};

function Onboarding({ children, state }: RouteProps<{}, Param>) {
  return (
    <Router type="stack">
      <MyScreen path="1" title="Onboarding 1" linkTo="../2" />
      <MyScreen path="2" title="Onboarding 2" linkTo="../3" />
      <MyScreen path="3" title="Onboarding 3" linkTo="/app" />
    </Router>
  );
}

function Signup({ children }: any) {
  return (
    <Router type="tabs">
      <MyScreen initial title="Signup" linkTo="onboarding/1" />
      <Onboarding path="onboarding" />
    </Router>
  );
}

function Login({ children }: any) {
  return (
    <Router type="tabs">
      <MyScreen path="reset-password" title="Reset Password" linkTo="/app" />

      <MyScreen
        path="forgot-password"
        title="Forgot password?"
        linkTo="../reset-password"
      />

      <MyScreen initial title="Login">
        <MyLink to="forgot-password">Forgot password?</MyLink>
      </MyScreen>
    </Router>
  );
}

function MyLink({ children, to }: any) {
  return (
    <Link to={to} style={{ padding: 10, borderWidth: 1, marginVertical: 10 }}>
      <Text>{children}</Text>
    </Link>
  );
}

function MyScreen({ title, color, linkTo, children }: any) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color || 'aquamarine',
      }}
    >
      <Text style={{ marginBottom: 20 }}>{title}</Text>
      {linkTo && <MyLink to={linkTo}>{linkTo}</MyLink>}

      {children}
    </View>
  );
}

function AppContainer({ children }: any) {
  return (
    <View
      style={{
        width: 400,
        height: 500,
        borderWidth: 1,
        marginVertical: 10,
        marginHorizontal: 'auto',
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

const APP_NAME = 'example';
// register the app
AppRegistry.registerComponent(APP_NAME, () => App);

// register the web
if (Platform.OS === 'web') {
  AppRegistry.runApplication(APP_NAME, {
    rootTag: document.getElementById('root'),
  });
}
