// app entry
import React from 'react';
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
  const routes = ['/', '/login', '/feeds'];

  return (
    <AppContainer>
      <Navigator routes={routes} showLocationBar>
        {({ activeIndex }) => (
          <>
            <Tabs pan={{ enabled: false }}>
              <Index routes={routes} />
              <Entry unmountOnExit />
              <Feeds unmountOnExit />
            </Tabs>

            {activeIndex === 1 && (
              <Link to="/" style={styles.homeButton}>
                <Text style={styles.title}>Home</Text>
              </Link>
            )}
          </>
        )}
      </Navigator>
    </AppContainer>
  );
}

function Index({ routes }: any) {
  const [, ...rest] = routes;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.title}>Index</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}
      >
        {rest.map((route: string) => (
          <Link
            key={route}
            to={`${route}`}
            style={{
              borderWidth: 1,
              borderRadius: 4,
              padding: 10,
              marginVertical: 10,
            }}
          >
            <Text>{route}</Text>
          </Link>
        ))}
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
