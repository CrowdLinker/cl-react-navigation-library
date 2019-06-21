import React from 'react';
import { Animated, Dimensions, StyleProp, ViewStyle } from 'react-native';

import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { width } = Dimensions.get('window');

interface PanHandlerProps {
  transition: (direction: 'right' | 'left') => void;
  children: any;
  enabled: boolean;
  style?: StyleProp<ViewStyle>;
}
class PanHandler extends React.Component<PanHandlerProps> {
  anim = new Animated.Value(0);

  state = {
    transitioning: false,
  };

  animate = (value: number) => {
    this.setState({ transitioning: true });

    Animated.spring(this.anim, {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      toValue: value,
      useNativeDriver: true,
    }).start(() => this.setState({ transitioning: false }));
  };

  handlePanGesture = ({ nativeEvent }: any) => {
    this.anim.setValue(nativeEvent.translationX / width);
  };

  handleGestureStateChange = ({ nativeEvent }: any) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.FAILED ||
      nativeEvent.state === State.CANCELLED
    ) {
      const dx = Math.floor(nativeEvent.translationX);

      const isSwipeRight = dx >= width / 3;
      const isSwipeLeft = dx <= -width / 3;

      if (isSwipeRight) {
        this.props.transition('left');
      }

      if (isSwipeLeft) {
        this.props.transition('right');
      }

      this.animate(0);
    }
  };

  render() {
    const { children, enabled } = this.props;

    // this will always be inside a <Router /> so we can just expand it to flex 1
    return (
      <PanGestureHandler
        enabled={enabled}
        onGestureEvent={this.handlePanGesture}
        onHandlerStateChange={this.handleGestureStateChange}
      >
        <Animated.View style={{ flex: 1 }}>
          {children({
            panValue: this.anim,
            transitioning: this.state.transitioning,
          })}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export default PanHandler;
