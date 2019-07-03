import React, { Component, cloneElement } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface ScreenProps {
  style?: StyleProp<ViewStyle>;
  active: boolean;
  children: any;
}

class Screen extends Component<ScreenProps> {
  shouldComponentUpdate(nextProps: ScreenProps) {
    return this.props.active || nextProps.active;
  }

  render() {
    const { children, active, style } = this.props;
    return (
      <View style={[style || { flex: 1 }]}>
        {cloneElement(children, { active })}
      </View>
    );
  }
}

export { Screen };
