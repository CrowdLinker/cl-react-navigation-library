import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import {
  Navigator,
  Tabs,
  Link,
  NavigatorScreen,
  Headers,
  Header,
} from 'react-navigation-library';
import { TextInput } from 'react-native-gesture-handler';

function Entry({  }: NavigatorScreen) {
  return (
    <Navigator routes={['signup-form', '/', 'login-form']} defaultIndex={1}>
      <Headers>
        <Header>
          <Text style={styles.title}>Signup</Text>
        </Header>
        <Header>
          <Text style={styles.title}>Select Option</Text>
        </Header>
        <Header>
          <Text style={styles.title}>Login</Text>
        </Header>
      </Headers>

      <Tabs>
        <Signup />
        <SelectionScreen />
        <Login />
      </Tabs>
    </Navigator>
  );
}

function Signup() {
  return (
    <Screen background="coral">
      <Form />
    </Screen>
  );
}

function Login() {
  return (
    <Screen background="cadetblue">
      <Form />
    </Screen>
  );
}

function SelectionScreen({ email = '' }: any) {
  return (
    <Screen background="aquamarine">
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Link to="signup-form" style={styles.button}>
          <Text>Signup</Text>
        </Link>
        <Link to="login-form" style={styles.button}>
          <Text>Login</Text>
        </Link>
      </View>
    </Screen>
  );
}

function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen>
      <View style={{ flex: 1, marginTop: 20, paddingHorizontal: 30 }}>
        <TextInput
          placeholder="Enter email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCompleteType="email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter password"
          textContentType="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Link to="/feeds/home" style={styles.button}>
          <Text style={{ textAlign: 'center' }}>Submit</Text>
        </Link>
      </View>
    </Screen>
  );
}

function Screen({ children, background = 'transparent' }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: background }}>{children}</View>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
  },

  button: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginVertical: 10,
  },

  input: {
    borderWidth: 1,
    marginVertical: 10,
    fontSize: 16,
    padding: 5,
    height: 40,
    borderRadius: 4,
    width: '100%',
  },
});

export { Entry };
