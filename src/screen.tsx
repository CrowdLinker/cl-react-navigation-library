import React, { Component, cloneElement, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface ScreenProps {
  style?: StyleProp<ViewStyle>;
  active: boolean;
  children: any;
}

class Screen extends Component<ScreenProps> {
  state = {
    alive: this.props.active,
  };

  timerRef: any = null;

  child = Children.only(this.props.children);

  componentDidUpdate() {
    if (!this.state.alive && this.props.active) {
      this.setState({ alive: true });
    }

    if (!this.props.active && this.child.props.unmountOnExit) {
      if (this.state.alive) {
        this.timerRef = setTimeout(() => {
          this.setState({ alive: false });
        }, 500);
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timerRef);
  }

  render() {
    const { children } = this.props;
    const { alive } = this.state;

    return <View style={[{ flex: 1 }]}>{alive ? children : null}</View>;
  }
}

export { Screen };
