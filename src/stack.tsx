import React, { Component, Children } from 'react';
import { NavigatorContext, NavigatorState } from './navigator';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
import { StyleProp, ViewStyle, View } from 'react-native';
import { Pager } from 'react-native-pager-component';

interface ScreenContainerProps {
  children: any;
  pan: Partial<PanGestureHandlerProperties>;
}
class StackImpl extends React.Component<ScreenContainerProps & NavigatorState> {
  static defaultProps = {
    pan: {
      enabled: true,
    },
  };

  isScreenActive = (childIndex: number) => {
    const { activeIndex } = this.props;
    return childIndex <= activeIndex;
  };

  render() {
    const { children, activeIndex, renderScreens, pan, ...rest } = this.props;

    const numberOfScreens = Children.count(children);

    if (numberOfScreens === 0) {
      return null;
    }

    return (
      <Pager
        {...rest}
        pan={{
          ...pan,
          enabled: pan.enabled && activeIndex > 0,
        }}
        activeIndex={activeIndex}
        numberOfScreens={numberOfScreens}
        clamp={{
          left: 0.4,
        }}
      >
        {renderScreens
          ? renderScreens(this.isScreenActive, children)
          : children}
      </Pager>
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
