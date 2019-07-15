import React, { Component, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { NavigatorContext, NavigatorState } from './navigator';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
import { Pager } from 'react-native-pager-component';

interface ScreenContainerProps {
  children: any;
  style?: StyleProp<ViewStyle>;
  pan: Partial<PanGestureHandlerProperties>;
}

class TabsImpl extends React.Component<ScreenContainerProps & NavigatorState> {
  static defaultProps = {
    pan: {
      enabled: true,
    },
  };

  isScreenActive = (childIndex: number) => {
    const { activeIndex } = this.props;
    return childIndex === activeIndex;
  };

  render() {
    const { children, renderScreens, ...rest } = this.props;

    const numberOfScreens = Children.count(children);

    if (numberOfScreens === 0) {
      return null;
    }

    return (
      <Pager {...rest} numberOfScreens={numberOfScreens}>
        {renderScreens
          ? renderScreens(this.isScreenActive, children)
          : children}
      </Pager>
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
