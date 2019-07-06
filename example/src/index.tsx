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
} from 'react-navigation-library';

import { FlatList } from 'react-native-gesture-handler';

function PagerTest() {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleChange(index: number) {
    setActiveIndex(index);
  }

  return (
    <View style={{ flex: 1 }}>
      <Pager
        index={activeIndex}
        onChange={handleChange}
        numberOfScreens={4}
        type="tabs"
      >
        <MyScreen style={{ backgroundColor: 'white' }}>
          <Text>Index 0</Text>
        </MyScreen>
        <MyScreen style={{ backgroundColor: 'white' }}>
          <Text>Index 1</Text>
        </MyScreen>
        <MyScreen style={{ backgroundColor: 'white' }}>
          <Text>Index 2</Text>
        </MyScreen>
        <MyScreen style={{ backgroundColor: 'white' }}>
          <Text>Index 3</Text>
        </MyScreen>
      </Pager>

      <View style={{ height: 100, width: '100%' }}>
        <Button title="Inc" onPress={() => setActiveIndex(activeIndex + 2)} />
        <Button title="Dec" onPress={() => setActiveIndex(activeIndex - 2)} />
      </View>
    </View>
  );
}

function App() {
  return (
    <AppContainer>
      <SafeAreaView />
      <Navigator
        name="MAIN_NAV"
        routes={['entry', 'app']}
        showLocationBar
        initialPath="/app/home/profile/2/three"
      >
        <Tabs name="MAIN_TABS">
          <Entry path="entry" />
          <Feeds path="app" />
        </Tabs>
      </Navigator>

      {/* <PagerTest /> */}
    </AppContainer>
  );
}

function Entry({  }: any) {
  return (
    <Navigator name="ENTRY_NAV" routes={['login', '/', 'signup']}>
      <Tabs name="ENTRY_TABS">
        <Login path="login" />
        <SelectMyScreen path="/" />
        <Signup path="signup" />
      </Tabs>
    </Navigator>
  );
}

function SelectMyScreen({  }: any) {
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

function Signup({  }: any) {
  return (
    <MyScreen>
      <Text>Signup!</Text>
      <Link to="/app">
        <Text>Go to app</Text>
      </Link>
    </MyScreen>
  );
}

function Login({  }: any) {
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
    <Navigator name="FEEDS" routes={['home', 'news', 'popular']}>
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
      <SafeAreaView />
      <Stack>
        <MyScreen style={{ backgroundColor: 'blue' }} path="/">
          <Link to="two">
            <Text>Next</Text>
          </Link>
        </MyScreen>
        <MyScreen style={{ backgroundColor: 'red' }} path="two">
          <Link to="three">
            <Text>Next</Text>
          </Link>
        </MyScreen>
        <MyScreen style={{ backgroundColor: 'green' }} path="three">
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
