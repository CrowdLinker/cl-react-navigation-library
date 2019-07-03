import React, { Component, Children } from 'react';
import { Stacker } from './stacker';
import { NavigatorContext, NavigatorState } from './navigator';
import { createScreen } from './create-screen';
import { Screen } from './screen';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';
import { StyleProp, ViewStyle, View } from 'react-native';

type Props = StackProps & NavigatorState;

class StackImpl extends Component<Props> {
  constructor(props: Props) {
    super(props);

    const routes = Children.map(
      props.children,
      element => element.props.path || '/'
    );

    props.setRoutes(routes);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children.length !== this.props.children.length) {
      const routes = Children.map(
        this.props.children,
        element => element.props.path || '/'
      );

      this.props.setRoutes(routes);
    }
  }

  render() {
    const {
      children,
      activeIndex,
      handleChange,
      routes,
      defaultIndex = 0,
      style,
      ...rest
    } = this.props;

    const index = activeIndex < 0 ? defaultIndex : activeIndex;

    return (
      <View style={[style || { flex: 1 }]}>
        <Stacker index={index} onChange={handleChange} {...rest}>
          {Children.map(children, (element: any, index: number) => {
            const active = index === activeIndex;

            return (
              <Screen active={active}>
                {createScreen(element, active, element.props.path)}
              </Screen>
            );
          })}
        </Stacker>
      </View>
    );
  }
}

interface StackProps extends PanGestureHandlerProperties {
  children: any;
  defaultIndex?: number;
  style?: StyleProp<ViewStyle>;
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
