import React from 'react';
import { Button, View, Text } from 'react-native';
import { render, fireEvent } from 'react-native-testing-library';
import { Router, Link, Header, RouteProps } from '../src/index';

jest.mock('NativeAnimatedHelper');

test('renders w/o crashing', () => {
  render(<TestApplication />);
});

test('initial path', () => {
  const { getByText } = render(<TestApplication initial="/home" />);
  getByText('screen-home');
});

test('navigating w/ absolute path', () => {
  const { getByText } = render(<TestApplication />);
  fireEvent.press(getByText('link-home'));

  getByText('screen-home');
});

test('navigating w/ relative path', () => {
  const { getByText } = render(<TestApplication />);
  fireEvent.press(getByText('relative-link-home'));

  getByText('screen-home');
});

test.skip('params match', () => {
  const { getByText } = render(<TestApplication />);

  getByText('header-welcome');

  fireEvent.press(getByText('relative-link-home'));

  getByText('header-home');
});

test.skip('nested params passed through to routes', () => {
  const { getByText } = render(<TestApplication />);

  fireEvent.press(getByText('nested-profile-link'));

  getByText('header-profile-1');
});

test('navigate prop works', () => {
  const { getByText } = render(<TestApplication />);

  fireEvent.press(getByText('navigate-link'));

  fireEvent.press(getByText('navigate-button'));

  getByText('screen-home');
});

test('navigate passes state to route', () => {
  const { getByText } = render(<TestApplication />);

  fireEvent.press(getByText('navigate-state-button'));

  getByText('123');
});

test('nested router', () => {
  const { getByText } = render(<TestApplication />);

  fireEvent.press(getByText('nested-link'));

  getByText('screen-nested-initial');
  fireEvent.press(getByText('screen-nested-1-link'));
  getByText('screen-nested-2');

  fireEvent.press(getByText('go-back-nested-1-link'));
  getByText('screen-nested-initial');
});

function TestApplication({ initial }: { initial?: string }) {
  return (
    <View>
      <Router initialPath={initial || `/welcome`} type="switch">
        <Router>
          <View path="welcome">
            {({ navigate }: any) => (
              <View>
                <Link to="/home">
                  <Text>link-home</Text>
                </Link>

                <Link to="../home">
                  <Text>relative-link-home</Text>
                </Link>

                <Link to="/profile/1/test">
                  <Text>nested-profile-link</Text>
                </Link>

                <Link to="/navigate">
                  <Text>navigate-link</Text>
                </Link>

                <Button
                  title="navigate-state-button"
                  onPress={() =>
                    navigate &&
                    navigate('/receive-state-screen', { data: '123' })
                  }
                />

                <Link to="/nested/nested-1">
                  <Text>nested-link</Text>
                </Link>
              </View>
            )}
          </View>

          <View path="home">
            <Text>screen-home</Text>
          </View>

          <View path="navigate">
            {({ navigate }: any) => (
              <Button
                title="navigate-button"
                onPress={() => navigate && navigate('/home')}
              />
            )}
          </View>

          <View path="receive-state-screen">
            {({ data }: any) => <Text>{data ? data : ''}</Text>}
          </View>

          <View path="nested">
            <InnerRouter />
          </View>
        </Router>
      </Router>
    </View>
  );
}

function InnerRouter() {
  return (
    <Router>
      <View path="nested-1">
        <View>
          <Text>screen-nested-initial</Text>
          <Link to="../nested-2">
            <Text>screen-nested-1-link</Text>
          </Link>
        </View>
      </View>
      <View path="nested-2">
        <View>
          <Text>screen-nested-2</Text>
          <Link to="../nested-1">
            <Text>go-back-nested-1-link</Text>
          </Link>
        </View>
      </View>
    </Router>
  );
}

function RouteHeader({ params }: RouteProps<{ screen: string }>) {
  return (
    <View>
      <Text>{`header-${params && params.screen}`}</Text>
    </View>
  );
}
