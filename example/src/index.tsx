// app entry
import React, { useState, Children } from 'react';
import {
  AppRegistry,
  Platform,
  View,
  Text,
  ViewStyle,
  StyleProp,
  Button,
  SafeAreaView,
} from 'react-native';
import {
  Link,
  Navigator,
  Tabbar,
  Tab,
  Tabs,
  Stack,
} from 'react-navigation-library';

import { FlatList } from 'react-native-gesture-handler';

function App() {
  return (
    <AppContainer>
      <SafeAreaView />
      <Navigator showLocationBar initialPath="/app/home">
        <Tabs>
          <Entry path="entry" unmountOnExit />
          <Feeds path="app" unmountOnExit />
        </Tabs>
      </Navigator>
    </AppContainer>
  );
}

function Entry({  }: any) {
  return (
    <Navigator>
      <Tabs defaultIndex={1}>
        <Login path="login" />
        <SelectScreen path="/" />
        <Signup path="signup" />
      </Tabs>
    </Navigator>
  );
}

function SelectScreen({  }: any) {
  return (
    <Screen
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'red',
      }}
    >
      <Text>Select Account Type:</Text>
      <Link to="login">
        <Text>Login</Text>
      </Link>
      <Link to="signup">
        <Text>Signup</Text>
      </Link>
    </Screen>
  );
}

function Signup({  }: any) {
  return (
    <Screen>
      <Text>Signup!</Text>
      <Link to="/app">
        <Text>Go to app</Text>
      </Link>
    </Screen>
  );
}

function Login({  }: any) {
  return (
    <Screen>
      <Text>Login!</Text>
      <Link to="/app">
        <Text>Go to app</Text>
      </Link>
    </Screen>
  );
}

function Feeds({  }: any) {
  return (
    <Navigator>
      <Tabs>
        <Feed name="Home" path="home" />
        <Feed name="News" path="news" />
        <Feed name="Popular" path="popular" />
      </Tabs>

      <Tabbar>
        <View style={{ flex: 1 }}>
          <Tab to="home">
            <Text>Home</Text>
          </Tab>
        </View>
        <Tab to="news">
          <Text>News</Text>
        </Tab>
        <Tab to="popular">
          <Text>Popular</Text>
        </Tab>
      </Tabbar>
    </Navigator>
  );
}

const items = Array.from({ length: 15 }).map((v, i) => {
  return {
    id: i,
    text: `Item: ${i}`,
  };
});

function Feed({  }: any) {
  return (
    <Navigator>
      {({ state }: any) => (
        <Stack>
          <List items={items} path="/" />
          <Profile path="profile/:id" unmountOnExit item={state.item} />
        </Stack>
      )}
    </Navigator>
  );
}

function List({ items }: any) {
  return (
    <FlatList
      style={{ flex: 1, padding: 10 }}
      contentContainerStyle={{ paddingVertical: 20 }}
      data={items}
      renderItem={Card}
      keyExtractor={(item: any) => `${item.id}`}
    />
  );
}

function Card({ item }: any) {
  return (
    <Link to={`profile/${item.id}`} style={styles.card} state={{ item }}>
      <Text>{`Card: ${item.id}`}</Text>
    </Link>
  );
}

function Profile({ item }: any) {
  if (!item) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      <Text>Item: {item.id}</Text>
      <ProfileStack />
    </View>
  );
}

function ProfileStack({}) {
  return (
    <Navigator>
      <SafeAreaView />
      <Stack>
        <Screen style={{ backgroundColor: 'blue' }} path="/">
          <Link to="two">
            <Text>Next</Text>
          </Link>
        </Screen>
        <Screen style={{ backgroundColor: 'red' }} path="two">
          <Link to="three">
            <Text>Next</Text>
          </Link>
        </Screen>
        <Screen style={{ backgroundColor: 'green' }} path="three">
          <Text>3</Text>
        </Screen>
      </Stack>
    </Navigator>
  );
}

const containerStyle: StyleProp<ViewStyle> = Platform.select({
  web: {
    width: 400,
    height: 500,
    borderWidth: 1,
    marginVertical: 10,
    marginHorizontal: 'auto',
    overflow: 'hidden',
  },
  default: {
    flex: 1,
  },
});

function AppContainer({ children }: any) {
  return <View style={containerStyle}>{children}</View>;
}

function Screen({ children, style }: any) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  card: {
    height: 75,
    width: '100%',
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const APP_NAME = 'example';
// register the app
AppRegistry.registerComponent(APP_NAME, () => App);

// register the web
if (Platform.OS === 'web') {
  AppRegistry.runApplication(APP_NAME, {
    rootTag: document.getElementById('root'),
  });
}
