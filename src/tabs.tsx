import React, { Component, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { NavigatorContext, NavigatorState } from './navigator';
import { createScreen } from './create-screen';
import { Screen } from './screen';
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
    rendered: [this.props.defaultIndex],
  };

  constructor(props: ScreenContainerProps & NavigatorState) {
    super(props);

    const routes = Children.map(
      props.children,
      element => element.props.path || '/'
    );

    props.setRoutes(routes);
  }

  componentDidUpdate(prevProps: ScreenContainerProps) {
    if (prevProps.index !== this.props.index) {
      if (this.props.index !== -1) {
        this.setState((state: any) => {
          return {
            rendered: [
              ...state.rendered.filter(i => i !== this.props.index),
              this.props.index,
            ],
          };
        });
      }
    }

    if (prevProps.children.length !== this.props.children.length) {
      const routes = Children.map(
        this.props.children,
        element => element.props.path || '/'
      );

      this.props.setRoutes(routes);
    }
  }

  render() {
    const { children, index, ...rest } = this.props;
    if (children.length === 0) {
      return null;
    }

    const { rendered } = this.state;
    const lastMatch = rendered[rendered.length - 1];
    const match = index > -1 ? index : lastMatch;

    return (
      <Pager
        {...rest}
        index={match}
        type="tabs"
        max={Children.count(children) - 1}
      >
        {Children.map(children, (element: any, i: number) => {
          const active = i === match;

          const screen = createScreen(element, active, element.props.path);
          return <Screen active={active}>{screen}</Screen>;
        })}
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
