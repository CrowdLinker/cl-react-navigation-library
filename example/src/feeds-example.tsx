import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Navigator,
  Tabs,
  Stack,
  Link,
  Headers,
  Header,
  Tabbar,
  Tab,
  NavigatorScreen,
} from 'react-navigation-library';
import { FlatList } from 'react-native-gesture-handler';

const items = Array.from({ length: 15 }, (c, i) => {
  return {
    id: i,
    text: `Item: ${i}`,
  };
});

function Feeds({  }: NavigatorScreen) {
  return (
    <Navigator routes={['home', 'popular', 'news']}>
      <Headers>
        <Header style={{ justifyContent: 'center' }}>
          <Text style={styles.title}>Home</Text>
        </Header>
        <Header style={{ justifyContent: 'center' }}>
          <Text style={styles.title}>News</Text>
        </Header>
        <Header style={{ justifyContent: 'center' }}>
          <Text style={styles.title}>Popular</Text>
        </Header>
      </Headers>

      <Tabs>
        <Feed items={items} />
        <Feed items={items} />
        <Feed items={items} />
      </Tabs>

      <Tabbar>
        <Tab to="home" activeStyle={{ borderWidth: 1 }}>
          <Text>Home</Text>
        </Tab>
        <Tab to="popular" activeStyle={{ borderWidth: 1 }}>
          <Text>Popular</Text>
        </Tab>
        <Tab to="news" activeStyle={{ borderWidth: 1 }}>
          <Text>News</Text>
        </Tab>
      </Tabbar>
    </Navigator>
  );
}

function Feed({ items }: any) {
  return (
    <Navigator routes={['/', '/p/:id']}>
      <Stack>
        <CardList items={items} />
        <ProfileView unmountOnExit />
      </Stack>
    </Navigator>
  );
}

function CardList({ items }: any) {
  return (
    <FlatList
      style={{ flex: 1, borderWidth: 1 }}
      contentContainerStyle={{ padding: 10 }}
      data={items}
      renderItem={Card}
      keyExtractor={(item: any) => `${item.id}`}
    />
  );
}

function Card({ item }: any) {
  return (
    <Link to={`p/${item.id}`} style={styles.card}>
      <Text style={styles.title}>{item.text}</Text>
    </Link>
  );
}

function ProfileView({ id }: any) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <Text style={styles.title}>{`Profile: ${id}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 75,
    width: '100%',
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export { Feeds };
