import React, { Component, Children } from 'react';
import { NavigatorContext, NavigatorState } from './navigator';
import { createScreen } from './create-screen';
import { Screen } from './screen';
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

  constructor(props: ScreenContainerProps & NavigatorState) {
    super(props);

    const routes = Children.map(
      props.children,
      element => element.props.path || '/'
    );

    props.setRoutes(routes);
  }

  state = {
    rendered: [this.props.defaultIndex],
  };

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
    const { children, index, style, pan, ...rest } = this.props;

    if (children.length === 0) {
      return null;
    }

    const { rendered } = this.state;
    const lastMatch = rendered[rendered.length - 1];
    const match = index > -1 ? index : lastMatch;

    return (
      <View style={[{ flex: 1 }, style]}>
        <Pager
          {...rest}
          pan={{
            ...pan,
            enabled: pan.enabled && match !== 0,
          }}
          index={match}
          type="stack"
          max={Children.count(children) - 1}
        >
          {Children.map(children, (element: any, i: number) => {
            const active = i <= match;
            const screen = createScreen(element, active, element.props.path);
            return <Screen active={active}>{screen}</Screen>;
          })}
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
