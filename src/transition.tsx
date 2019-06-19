import React from 'react';
import {
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  Platform,
  // Easing,
} from 'react-native';
export type NavigatorType = 'stack' | 'tabs' | 'switch';

export interface TransitionProps {
  index: number;
  activeIndex: number;
  total: number;
  children: any;
  shouldRenderChild: boolean;
  type?: NavigatorType;
  pathname?: string;
  style?: StyleProp<ViewStyle>;
  state: Object;
  interpolate?: TransitionInterpolate;
  animation?: TransitionAnimation;
  animated?: boolean;
  onTransitionEnd?: () => void;
}

export type TransitionAnimation = (
  value: Animated.Value,
  index: number,
  activeIndex: number
) => any;

export type TransitionInterpolate = (
  value: Animated.Value,
  args: AnimationArgs
) => any;

export interface AnimationArgs {
  type?: NavigatorType;
  width: number;
  height: number;
  index: number;
  activeIndex: number;
  total: number;
}

function getAnimatedValue(index: number, activeIndex: number) {
  const animatedValue =
    index < activeIndex ? -1 : index === activeIndex ? 0 : 1;

  return animatedValue;
}

const defaultAnimation = Platform.select({
  default: (value: Animated.Value, index: number, activeIndex: number) =>
    Animated.spring(value, {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      toValue: getAnimatedValue(index, activeIndex),
      useNativeDriver: true,
    }),

  // android: (value: Animated.Value, index: number, activeIndex: number) =>
  //   Animated.timing(value, {
  //     duration: index === activeIndex ? 350 : 150,
  //     easing: Easing.in(Easing.linear),
  //     toValue: getAnimatedValue(index, activeIndex),
  //   }),
});

const defaultInterpolation = Platform.select({
  default: (value: Animated.Value, args: AnimationArgs): any => {
    const { width, type } = args;
    let offset = width + 5;

    const baseNegative = type === 'stack' ? 0 : -offset;

    return {
      transform: [
        {
          translateX: value.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [baseNegative, 0, offset],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  },

  // android: (value: Animated.Value, args: AnimationArgs): any => {
  //   const { height } = args;
  //   return {
  //     opacity: value.interpolate({
  //       inputRange: [-1, -0.9, -0.5, 0, 0.5, 0.9, 1],
  //       outputRange: [0, 0.25, 0.7, 1, 0.7, 0.25, 0],
  //       extrapolate: 'clamp',
  //     }),
  //     transform: [
  //       {
  //         translateY: value.interpolate({
  //           inputRange: [-1, 0, 1],
  //           outputRange: [height * 0.08, 0, height * 0.08],
  //           extrapolate: 'clamp',
  //         }),
  //       },
  //     ],
  //   };
  // },
});
class Transition extends React.Component<TransitionProps> {
  static defaultProps = {
    type: 'tabs',
    animated: true,
  };

  state = {
    animating: false,
    height: 0,
    width: 0,
  };

  anim = new Animated.Value(
    getAnimatedValue(this.props.index, this.props.activeIndex)
  );

  animate = () => {
    const { activeIndex, index, animated, onTransitionEnd } = this.props;

    if (!animated) {
      this.anim.setValue(getAnimatedValue(index, activeIndex));
    } else {
      this.setState({ animating: true }, () => {
        const animation = this.props.animation || defaultAnimation;

        animation(this.anim, index, activeIndex).start(() => {
          this.setState({ animating: false });
          onTransitionEnd && onTransitionEnd();
        });
      });
    }
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
    const { activeIndex, index } = this.props;
    if (activeIndex === index) {
      this.animate();
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.activeIndex !== this.props.activeIndex) {
      // will become active or becoming inactive
      if (
        prevProps.activeIndex === this.props.index ||
        this.props.activeIndex === this.props.index
      ) {
        this.animate();
      } else {
        // move screen w/o animation as its an intermediate screen
        this.anim.setValue(
          getAnimatedValue(this.props.index, this.props.activeIndex)
        );
      }
    }
  }

  render() {
    const {
      children,
      activeIndex,
      total,
      index,
      type,
      shouldRenderChild,
      interpolate = defaultInterpolation,
      style,
    } = this.props;

    const { width, height } = this.state;

    const animatedStyle = interpolate(this.anim, {
      type,
      width,
      height,
      index,
      activeIndex,
      total,
    });

    const shouldUnmount = !shouldRenderChild && !this.state.animating;

    return (
      <Animated.View
        onLayout={this.setSize}
        style={[
          style || StyleSheet.absoluteFillObject,
          animatedStyle,
          {
            overflow: 'hidden',
          },
        ]}
      >
        {shouldUnmount || !children ? null : children}
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
