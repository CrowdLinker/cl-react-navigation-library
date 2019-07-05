import React, { Component, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { NavigatorContext, NavigatorState } from './navigator';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
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

class TabsImpl extends React.Component<ScreenContainerProps & NavigatorState> {
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

  isScreenActive = (childIndex: number, childElement: any) => {
    const { matchingIndex } = this.state;
    if (childElement.props.lazy) {
      return childIndex === matchingIndex;
    }

    return true;
  };

  render() {
    const { children, index, ...rest } = this.props;

    if (children.length === 0) {
      return null;
    }

    const { matchingIndex } = this.state;

    return (
      <Pager
        {...rest}
        index={matchingIndex}
        type="tabs"
        max={Children.count(children) - 1}
      >
        {this.props.renderScreens(this.isScreenActive, children)}
      </Pager>
    );
  }
}

interface TabsProps extends PanGestureHandlerProperties {
  children: any;
  defaultIndex?: number;
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
