// app entry
import React, { useState, useEffect } from 'react';
import {
  AppRegistry,
  Platform,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Entry } from './entry-example';
import { Feeds } from './feeds-example';
import { ScrollView } from 'react-native-gesture-handler';
import { Link, Navigator, Tabs, BOTTOM_SPACE } from 'react-navigation-library';

function App() {
  const routes = ['/login', '/', '/feeds'];

  return (
    <AppContainer>
      <Navigator routes={routes} showLocationBar>
        <Tabs pan={{ enabled: false }}>
          <Entry />
          <Index />
          <Feeds />
        </Tabs>
      </Navigator>
    </AppContainer>
  );
}

function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.title}>Index</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}
      >
        <Link to={`/login`} style={styles.link}>
          <Text>Login</Text>
        </Link>
        <Link to={`/feeds/home`} style={styles.link}>
          <Text>Feeds</Text>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppContainer({ children }: any) {
  return <View style={styles.appContainer}>{children}</View>;
}

const styles = StyleSheet.create({
  appContainer: Platform.select({
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
  }),

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  homeButton: {
    width: 200,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: BOTTOM_SPACE + 10,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  link: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginVertical: 10,
  },
});

const APP_NAME = 'example';
// register the app
AppRegistry.registerComponent(APP_NAME, () => App);

// register the web
if (Platform.OS === 'web') {
  AppRegistry.runApplication(APP_NAME, {
    rootTag: document.getElementById('root'),
  });
}
