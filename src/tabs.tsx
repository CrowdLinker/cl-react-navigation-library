import React, { Component, Children } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Pager, PagerProps } from './pager';
import { NavigatorContext, NavigatorState } from './navigator';
import { createScreen } from './create-screen';
import { Screen } from './screen';
import { PanGestureHandlerProperties } from 'react-native-gesture-handler';

type Props = TabsProps & Partial<PagerProps> & NavigatorState;

class TabsImpl extends Component<Props> {
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
      style,
      children,
      activeIndex,
      handleChange,
      routes,
      defaultIndex = 0,
      ...rest
    } = this.props;

    const index = activeIndex < 0 ? defaultIndex : activeIndex;

    return (
      <View style={[style || { flex: 1 }]}>
        <Pager {...rest} index={index} onChange={handleChange}>
          {Children.map(children, (element: any, index: number) => {
            const active = index === activeIndex;

            return (
              <Screen active={active}>
                {createScreen(element, active, element.props.path || '/')}
              </Screen>
            );
          })}
        </Pager>
      </View>
    );
  }
}

interface TabsProps extends PanGestureHandlerProperties {
  children: any;
  defaultIndex?: number;
  style?: StyleProp<ViewStyle>;
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
