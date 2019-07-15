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
import { TextInput, BorderlessButton } from 'react-native-gesture-handler';

function Entry({  }: NavigatorScreen) {
  return (
    <Navigator routes={['signup-form', '/', 'login-form']} defaultIndex={1}>
      {({ navigate, state }: any) => (
        <>
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
            <Signup navigate={navigate} />
            <SelectionScreen email={state.email} />
            <Login navigate={navigate} />
          </Tabs>
        </>
      )}
    </Navigator>
  );
}

function Signup({ navigate }: any) {
  function handleSubmit(email: string, password: string) {
    // return to selection screen
    navigate('./', { email, password });
  }

  return (
    <Screen background="coral">
      <Form title="Signup" onSubmit={handleSubmit} />
    </Screen>
  );
}

function Login({ navigate }: any) {
  function handleSubmit(email: string, password: string) {
    // return to selection screen
    navigate('./', { email, password });
  }

  return (
    <Screen background="cadetblue">
      <Form title="Login" onSubmit={handleSubmit} />
    </Screen>
  );
}

function SelectionScreen({ email = '' }: any) {
  return (
    <Screen background="aquamarine">
      {Boolean(email) && (
        <Text
          style={[styles.title, { flex: 0, marginVertical: 20 }]}
        >{`Thanks ${email}!`}</Text>
      )}

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

function Form({ onSubmit }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit() {
    onSubmit(email, password);
  }

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

        <BorderlessButton onPress={handleSubmit} style={styles.button}>
          <Text style={{ textAlign: 'center' }}>Submit</Text>
        </BorderlessButton>
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
