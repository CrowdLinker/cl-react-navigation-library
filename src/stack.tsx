import React, { Component, Children } from 'react';
import { NavigatorContext, NavigatorState } from './navigator';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
import { StyleProp, ViewStyle, View } from 'react-native';
import { Pager } from './pager';

interface ScreenContainerProps {
  onChange: (index: number) => void;
  index: number;
  defaultIndex: number;
  children: any;
  width?: number;
  pan: Partial<PanGestureHandlerProperties>;
  style?: StyleProp<ViewStyle>;
}
class StackImpl extends React.Component<ScreenContainerProps & NavigatorState> {
  static defaultProps = {
    defaultIndex: 0,
    pan: {
      enabled: true,
    },
  };

  state = {
    matchingIndex: this.props.defaultIndex,
  };

  componentDidUpdate(prevProps: ScreenContainerProps) {
    const { index, defaultIndex } = this.props;
    if (prevProps.index !== index) {
      this.setState({ matchingIndex: index === -1 ? defaultIndex : index });
    }
  }

  isScreenActive = (childIndex: number) => {
    const { matchingIndex } = this.state;
    return childIndex <= matchingIndex;
  };

  render() {
    const { children, style, pan, ...rest } = this.props;

    if (children.length === 0) {
      return null;
    }

    const { matchingIndex } = this.state;

    return (
      <View style={[{ flex: 1 }, style]}>
        <Pager
          {...rest}
          pan={{
            ...pan,
            enabled: pan.enabled && matchingIndex > 0,
          }}
          index={matchingIndex}
          type="stack"
          max={Children.count(children) - 1}
        >
          {this.props.renderScreens(this.isScreenActive, this.props.children)}
        </Pager>
      </View>
    );
  }
}

interface StackProps extends PanGestureHandlerProperties {
  children: any;
  defaultIndex?: number;
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
