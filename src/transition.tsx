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
  type: NavigatorType;
  pathname?: string;
  style?: StyleProp<ViewStyle>;
  state: Object;
  interpolate: TransitionInterpolate;
  animation: TransitionAnimation;
  animated?: boolean;
  panValue: Animated.Value;
  panning?: boolean;
}

export type TransitionAnimation = (
  value: Animated.Value,
  toValue: number
) => any;

export type TransitionInterpolate = (
  value: Animated.AnimatedAddition,
  args: AnimationArgs
) => any;

export interface AnimationArgs {
  type: NavigatorType;
  width: number;
  height: number;
}

function getAnimatedValue(index: number, activeIndex: number) {
  if (index < activeIndex) {
    const offset = index - activeIndex;
    return Math.max(offset, -2);
  }

  if (index > activeIndex) {
    const offset = index - activeIndex;
    return Math.min(offset, 2);
  }

  return 0;
}

function spring(value: Animated.Value, toValue: number) {
  return Animated.spring(value, {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    toValue: toValue,
    useNativeDriver: true,
  });
}

// function timing(value: Animated.Value, toValue: number) {
//   return Animated.timing(value, {
//     duration: toValue === 0 ? 150 : 350,
//     easing:
//       toValue === 0 ? Easing.in(Easing.linear) : Easing.out(Easing.poly(5)),
//     toValue: toValue,
//     useNativeDriver: true,
//   });
// }

const animation = Platform.select({
  default: spring,
  // android: timing,
});

function horizontal(
  value: Animated.AnimatedAddition,
  width: number,
  type: NavigatorType
) {
  let offset = width + 5;
  const baseNegative = type === 'stack' ? 0 : -offset;

  return {
    transform: [
      {
        translateX: value.interpolate({
          inputRange: [-2, -1, 0, 1, 2],
          outputRange: [baseNegative * 2, baseNegative, 0, offset, offset * 2],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
}

// function vertical(value: Animated.Value, height: number) {
//   return {
//     transform: [
//       {
//         translateY: value.interpolate({
//           inputRange: [-1, 0, 1],
//           outputRange: [0, 0, height],
//         }),
//       },
//     ],
//   };
// }

const interpolate = Platform.select({
  default: (value: Animated.AnimatedAddition, args: AnimationArgs): any => {
    const { width, type } = args;
    return horizontal(value, width, type);
  },

  // android: (value: Animated.Value, args: AnimationArgs): any => {
  //   const { height, width, type } = args;
  //   if (type === 'stack') {
  //     return vertical(value, height);
  //   }

  //   return horizontal(value, width, type);
  // },
});
class Transition extends React.Component<TransitionProps> {
  static defaultProps = {
    type: 'tabs',
    animated: true,
    animation: animation,
    interpolate: interpolate,
  };

  state = {
    animating: false,
    height: 0,
    width: 0,
    panDisabled: false,
  };

  anim = new Animated.Value(
    getAnimatedValue(this.props.index, this.props.activeIndex)
  );

  animate = (toValue: number) => {
    const { animated, animation } = this.props;

    if (!animated) {
      this.anim.setValue(toValue);
    } else {
      this.setState({ animating: true }, () => {
        animation(this.anim, toValue).start(() => {
          this.setState({ animating: false });
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

  componentDidUpdate(prevProps: TransitionProps) {
    const { index, activeIndex } = this.props;
    const toValue = getAnimatedValue(index, activeIndex);
    const offset = Math.abs(toValue);

    if (prevProps.activeIndex !== this.props.activeIndex) {
      // screen is not adjacent so we dont want panValue to update its position
      if (offset === 2) {
        this.setState({ panDisabled: true });
      }

      // will become active or becoming inactive
      if (prevProps.activeIndex === index || activeIndex === index) {
        this.animate(toValue);
      } else {
        // move screen w/o animation as its an intermediate screen
        this.anim.setValue(toValue);
      }
    }

    // screen is now adjacent and pan animation finished -- screen should respond to panValue
    if (this.state.panDisabled && offset < 2 && !this.props.panning) {
      this.setState({ panDisabled: false });
    }
  }

  render() {
    let {
      children,
      type,
      shouldRenderChild,
      interpolate,
      style,
      panValue,
    } = this.props;

    const { width, height, panDisabled } = this.state;
    const animatedValue = Animated.add(panDisabled ? 0 : panValue, this.anim);

    const animatedStyle = interpolate(animatedValue, {
      type,
      width,
      height,
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
