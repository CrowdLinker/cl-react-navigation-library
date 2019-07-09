import React, { Component, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { NavigatorContext, NavigatorState } from './navigator';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
import PagerContainer, { Pager } from './pager';

interface ScreenContainerProps {
  onChange: (index: number) => void;
  index: number;
  children: any;
  width?: number;
  pan: Partial<PanGestureHandlerProperties>;
  style?: StyleProp<ViewStyle>;
}

class TabsImpl extends React.Component<ScreenContainerProps & NavigatorState> {
  static defaultProps = {
    pan: {
      enabled: true,
    },
  };

  isScreenActive = (childIndex: number, childElement: any) => {
    const { index } = this.props;
    return childIndex === index;
  };

  render() {
    const { children, index, ...rest } = this.props;

    if (children.length === 0) {
      return null;
    }

    return (
      <PagerContainer
        {...rest}
        index={index}
        type="tabs"
        numberOfScreens={Children.count(children)}
      >
        {this.props.renderScreens(this.isScreenActive, children)}
      </PagerContainer>
    );
  }
}

interface TabsProps extends PanGestureHandlerProperties {
  children: any;
  style?: StyleProp<ViewStyle>;
  pan?: Partial<PanGestureHandlerProperties>;
  width?: number;
}

function Tabs({ children, ...rest }: TabsProps) {
  return (
    <NavigatorContext.Consumer>
      {navigator => (
        <TabsImpl {...navigator} {...rest}>
          {children}
        </TabsImpl>
      )}
    </NavigatorContext.Consumer>
  );
}

export { Tabs };
