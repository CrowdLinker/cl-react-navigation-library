import React, { Component, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { BasepathContext } from './navigation-provider';

interface ScreenProps {
  style?: StyleProp<ViewStyle>;
  active: boolean;
  children: any;
  path: string;
}

export interface NavigatorScreen {
  children?: any;
  unmountOnExit?: boolean;
  lazy?: boolean;
  style?: StyleProp<ViewStyle>;
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
    const { children, path } = this.props;
    const { alive } = this.state;

    return alive ? (
      <View style={[{ flex: 1 }, this.child.props.style]}>
        <BasepathContext.Provider value={path}>
          {children}
        </BasepathContext.Provider>
      </View>
    ) : null;
  }
}

export { Screen };
