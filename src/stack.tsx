import React, { Component, Children } from 'react';
import { NavigatorContext, NavigatorState } from './navigator';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
import { StyleProp, ViewStyle, View } from 'react-native';
import PagerContainer, { Pager } from './pager';

interface ScreenContainerProps {
  onChange: (index: number) => void;
  index: number;
  children: any;
  width?: number;
  pan: Partial<PanGestureHandlerProperties>;
  style?: StyleProp<ViewStyle>;
}
class StackImpl extends React.Component<ScreenContainerProps & NavigatorState> {
  static defaultProps = {
    pan: {
      enabled: true,
    },
  };

  isScreenActive = (childIndex: number) => {
    const { index } = this.props;
    return childIndex <= index;
  };

  render() {
    const { children, style, index, pan, ...rest } = this.props;

    if (children.length === 0) {
      return null;
    }

    return (
      <View style={[{ flex: 1 }, style]}>
        <PagerContainer
          {...rest}
          pan={{
            ...pan,
            enabled: pan.enabled && index > 0,
          }}
          index={index}
          type="stack"
          numberOfScreens={Children.count(children)}
        >
          {this.props.renderScreens(this.isScreenActive, this.props.children)}
        </PagerContainer>
      </View>
    );
  }
}

interface StackProps extends PanGestureHandlerProperties {
  children: any;
  style?: StyleProp<ViewStyle>;
  pan?: Partial<PanGestureHandlerProperties>;
  width?: number;
}

function Stack({ children, ...rest }: StackProps) {
  return (
    <NavigatorContext.Consumer>
      {navigator => (
        <StackImpl {...navigator} {...rest}>
          {children}
        </StackImpl>
      )}
    </NavigatorContext.Consumer>
  );
}

export { Stack };
