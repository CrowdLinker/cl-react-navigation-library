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
  Pager,
  Tabbar,
  Tab,
  Tabs,
  Stack,
} from 'react-navigation-library';

import { FlatList, BorderlessButton } from 'react-native-gesture-handler';

function PagerApp() {
  const [activeIndex, setActiveIndex] = useState(-1);

  function handleChange(index: number) {
    setActiveIndex(index);
  }

  return (
    <AppContainer>
      <Pager
        type="stack"
        index={activeIndex}
        onChange={handleChange}
        width={150}
        max={5}
      >
        <ScreenA style={{ backgroundColor: 'aquamarine' }} unmountOnExit>
          <Text>0</Text>
          <BorderlessButton onPress={() => setActiveIndex(activeIndex + 1)}>
            <Text>Next</Text>
          </BorderlessButton>
        </ScreenA>
        <ScreenA style={{ backgroundColor: 'orange' }} unmountOnExit>
          <Text>1</Text>
          <BorderlessButton onPress={() => setActiveIndex(activeIndex + 1)}>
            <Text>Next</Text>
          </BorderlessButton>
        </ScreenA>
        <ScreenA style={{ backgroundColor: 'yellow' }}>
          <Text>2</Text>
          <BorderlessButton onPress={() => setActiveIndex(activeIndex + 1)}>
            <Text>Next</Text>
          </BorderlessButton>
        </ScreenA>
        <ScreenA style={{ backgroundColor: 'green' }}>
          <Text>3</Text>
        </ScreenA>
        <ScreenA style={{ backgroundColor: 'purple' }}>
          <Text>4</Text>
        </ScreenA>
      </Pager>

      <View style={{ height: 100, width: '100%' }}>
        <Button title="Inc" onPress={() => setActiveIndex(activeIndex + 1)} />
        <Button title="Dec" onPress={() => setActiveIndex(activeIndex - 1)} />
      </View>
    </AppContainer>
  );
}

function ScreenA({ children, style }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

function ProfileStack({}) {
  return (
    <Navigator>
      <SafeAreaView />
      <Stack>
        <ScreenA style={{ backgroundColor: 'blue' }} path="/">
          <Link to="two">
            <Text>Next</Text>
          </Link>
        </ScreenA>
        <ScreenA style={{ backgroundColor: 'red' }} path="two">
          <Link to="../three">
            <Text>Next</Text>
          </Link>
        </ScreenA>
        <ScreenA style={{ backgroundColor: 'green' }} path="three">
          <Text>3</Text>
        </ScreenA>
      </Stack>
    </Navigator>
  );
}

function App() {
  return (
    <AppContainer>
      <Navigator name="main-tabs" showLocationBar initialPath="/home">
        <SafeAreaView />
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
    </AppContainer>
  );
}

const items = Array.from({ length: 15 }).map((v, i) => {
  return {
    id: i,
    text: `Item: ${i}`,
  };
});

function Feed({ name }: any) {
  return (
    <Navigator name={name}>
      <Stack>
        <List items={items} />
        <Profile path="/profile/:id" unmountOnExit />
      </Stack>
    </Navigator>
  );
}

function List({ items }) {
  return (
    <FlatList
      style={{ flex: 1, padding: 10 }}
      contentContainerStyle={{ paddingVertical: 20 }}
      data={items}
      renderItem={Card}
      keyExtractor={item => `${item.id}`}
    />
  );
}

function Card({ item }) {
  return (
    <Link to={`profile/${item.id}`} style={styles.card} state={{ item }}>
      <Text>{`Card: ${item.id}`}</Text>
    </Link>
  );
}

function Profile({ item = {} }) {
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
    // top: 50,
    // width: 150,
    // height: 150,
    // alignSelf: 'center',
    flex: 1,
  },
});

function AppContainer({ children }: any) {
  return <View style={containerStyle}>{children}</View>;
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
