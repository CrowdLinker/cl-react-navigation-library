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
  Pager,
  Headers,
  Header,
  NavigatorScreen,
} from 'react-navigation-library';

import { FlatList } from 'react-native-gesture-handler';

function PagerTest() {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleChange(index: number) {
    setActiveIndex(index);
  }

  const children = Array.from({ length: activeIndex + 2 });

  return (
    <View style={{ flex: 1 }}>
      <Pager
        index={activeIndex}
        onChange={handleChange}
        numberOfScreens={children.length}
        type="stack"
      >
        {children.map((c, i) => {
          return (
            <MyScreen key={i} style={{ backgroundColor: 'white' }}>
              <Text>{`Index: ${i}`}</Text>
            </MyScreen>
          );
        })}
      </Pager>

      <View style={{ height: 100, width: '100%' }}>
        <Button title="Inc" onPress={() => setActiveIndex(activeIndex + 1)} />
        <Button title="Dec" onPress={() => setActiveIndex(activeIndex - 1)} />
      </View>
    </View>
  );
}

function App() {
  return (
    <AppContainer>
      <Navigator routes={['entry', 'app']} initialPath="/entry">
        <Tabs>
          <Entry unmountOnExit />
          <Feeds unmountOnExit />
        </Tabs>
      </Navigator>

      {/* <PagerTest /> */}
    </AppContainer>
  );
}

function Entry({  }: NavigatorScreen) {
  return (
    <Navigator defaultIndex={1} routes={['login', '/', 'signup']}>
      <Tabs>
        <Login lazy />
        <SelectMyScreen />
        <Signup lazy />
      </Tabs>
    </Navigator>
  );
}

function SelectMyScreen({  }: NavigatorScreen) {
  return (
    <MyScreen
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
    </MyScreen>
  );
}

function Signup({  }: NavigatorScreen) {
  return (
    <MyScreen>
      <Text>Signup!</Text>
      <Link to="/app">
        <Text>Go to app</Text>
      </Link>
    </MyScreen>
  );
}

function Login({  }: NavigatorScreen) {
  return (
    <MyScreen>
      <Text>Login!</Text>
      <Link to="/app">
        <Text>Go to app</Text>
      </Link>
    </MyScreen>
  );
}

function Feeds({  }: any) {
  return (
    <Navigator routes={['home', 'news', 'popular']}>
      <Headers>
        <Header>
          <Text>Home</Text>
        </Header>
        <Header>
          <Text>News</Text>
        </Header>
        <Header>
          <Text>Popular</Text>
        </Header>
      </Headers>

      <Tabs>
        <Feed name="Home" path="home" />
        <Feed name="News" path="news" />
        <Feed name="Popular" path="popular" />
      </Tabs>

      <Tabbar>
        <Tab to="home" activeStyle={{ borderWidth: 1 }}>
          <Text>Home</Text>
        </Tab>
        <Tab to="news" activeStyle={{ borderWidth: 1 }}>
          <Text>News</Text>
        </Tab>
        <Tab to="popular" activeStyle={{ borderWidth: 1 }}>
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
    <Navigator name="FEED" routes={['/', 'profile/:id']}>
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
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      {/* <Text>Item: {item.id}</Text> */}
      <ProfileStack />
    </View>
  );
}

function ProfileStack({}) {
  return (
    <Navigator routes={['/', 'two', 'three']}>
      <Stack>
        <MyScreen
          style={{
            backgroundColor: 'blue',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          path="/"
        >
          <Link to="two">
            <Text>Next</Text>
          </Link>
        </MyScreen>
        <MyScreen
          style={{
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          path="two"
        >
          <Link to="three">
            <Text>Next</Text>
          </Link>
        </MyScreen>
        <MyScreen
          style={{
            backgroundColor: 'green',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          path="three"
        >
          <Text>3</Text>
        </MyScreen>
      </Stack>
    </Navigator>
  );
}

const containerStyle: StyleProp<ViewStyle> = Platform.select({
  web: {
    width: 400,
    height: 500,

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

function MyScreen({ children, style }: any) {
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
