import React from 'react';
import { StyleSheet, Animated } from 'react-native';

export type NavigatorType = 'stack' | 'tabs' | 'switch';

function getAnimatedValue(index: number, activeIndex: number) {
  const animatedValue =
    index < activeIndex ? -1 : index === activeIndex ? 0 : 1;

  return animatedValue;
}

interface TransitionProps {
  type: NavigatorType;
  index: number;
  activeIndex: number;
  total: number;
  children: any;
  shouldRenderChild: boolean;
  pathname: string;
}

class Transition extends React.Component<TransitionProps> {
  static defaultProps = {
    type: 'tabs',
  };

  anim = new Animated.Value(
    getAnimatedValue(this.props.index, this.props.activeIndex)
  );

  animate = () => {
    this.setState({ animating: true }, () => {
      Animated.spring(this.anim, {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        toValue: getAnimatedValue(this.props.index, this.props.activeIndex),
        useNativeDriver: true,
      }).start(() => this.setState({ animating: false }));
    });
  };

  animation(anim: any, type = 'tabs') {
    const { width } = this.state;

    let offset = width + 5;

    const baseNegative = type === 'stack' ? 0 : -offset;

    return {
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [baseNegative, 0, offset],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  }

  state = {
    animating: false,
    height: 0,
    width: 0,
  };

  setSize = ({
    nativeEvent: {
      layout: { width = 0, height = 0 },
    },
  }) => {
    this.setState({
      height,
      width,
    });
  };

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.activeIndex !== this.props.activeIndex) {
      this.animate();
    }
  }

  render() {
    const {
      children,
      activeIndex,
      index,
      type,
      shouldRenderChild,
    } = this.props;

    const animation = this.animation(this.anim, type);
    const focused = activeIndex === index;
    const shouldUnmount = !shouldRenderChild && !this.state.animating;

    return (
      <Animated.View
        onLayout={this.setSize}
        style={{
          ...StyleSheet.absoluteFillObject,
          ...animation,
          overflow: 'hidden',
        }}
      >
        {shouldUnmount || !children
          ? null
          : React.cloneElement(children, { focused })}
      </Animated.View>
    );
  }
}

export default Transition;

// interface PanHandlerProps {
//   type: RouterType;
//   focusIndex: number;
//   total: number;
//   transition: (amount: number) => void;
//   children: any;
// }
// class PanHandler extends React.Component<PanHandlerProps> {
//   anim = new Animated.Value(0);

//   state = {
//     transitioning: false,
//   };

//   animate = (value: number) => {
//     this.setState({ transitioning: true });
//     Animated.spring(this.anim, {
//       stiffness: 1000,
//       damping: 500,
//       mass: 3,
//       overshootClamping: true,
//       restDisplacementThreshold: 0.01,
//       restSpeedThreshold: 0.01,
//       toValue: value,
//       useNativeDriver: true,
//     }).start(() => this.setState({ transitioning: false }));
//   };

//   panResponder = PanResponder.create({
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderMove: (_, gestureState) => {
//       this.anim.setValue(gestureState.dx / width);
//     },
//     onPanResponderTerminationRequest: () => false,
//     onPanResponderRelease: (_, gestureState) => {
//       const dx = Math.floor(gestureState.dx)

//       const isSwipeRight = dx >= width / 2
//       const isSwipeLeft = dx <= -width / 2

//       if (isSwipeRight) {
//         this.props.transition(this.props.focusIndex - 1);
//       }

//       if (isSwipeLeft) {
//         this.props.transition(this.props.focusIndex + 1);
//       }

//       this.animate(0);
//     },
//   });

//   render() {
//     const { children } = this.props;

//     return children({
//       anim: this.anim,
//       panHandlers: this.panResponder.panHandlers,
//     });
//   }
// }
