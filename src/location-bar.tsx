import React from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
import { Navigate, Back } from './navigation';

interface LocationBarProps {
  path: string;
  navigate: Navigate;
  back: Back;
}

class LocationBar extends React.Component<LocationBarProps> {
  state = {
    url: this.props.path,
    hidden: false,
  };

  componentDidUpdate(prevProps: any) {
    if (prevProps.path !== this.props.path) {
      this.setState({ url: this.props.path });
    }
  }

  handleInput = (text: string) => {
    this.setState({ url: text.trim() });
  };

  handleBlur = () => {
    this.props.navigate(this.state.url, this.props.path);
  };

  render() {
    return !this.state.hidden ? (
      <View style={styles.locationBarVisible}>
        <Button title="Back" onPress={() => this.props.back(1)} />
        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: 10,
            borderRadius: 4,
            marginLeft: 5,
            borderWidth: StyleSheet.hairlineWidth,
          }}
          placeholder="URL Bar"
          value={this.state.url}
          onChangeText={this.handleInput}
          onBlur={this.handleBlur}
        />
        <Button
          title="Hide"
          onPress={() => this.setState({ hidden: !this.state.hidden })}
        />
      </View>
    ) : (
      <View style={styles.locationBarHidden}>
        <Button title="Show" onPress={() => this.setState({ hidden: false })} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  locationBarVisible: {
    height: 60,
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
  locationBarHidden: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: 60,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
  },
});

export { LocationBar };
