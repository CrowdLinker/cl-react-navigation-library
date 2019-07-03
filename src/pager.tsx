import React, { Children } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  State,
  PanGestureHandler,
  PanGestureHandlerProperties,
} from 'react-native-gesture-handler';

const {
  Value,
  Clock,
  block,
  cond,
  set,
  and,
  startClock,
  stopClock,
  clockRunning,
  eq,
  divide,
  multiply,
  greaterOrEq,
  lessOrEq,
  add,
  neq,
  event,
  spring,
  onChange,
  call,
  debug,
  diffClamp,
  min,
  max,
  lessThan,
  greaterThan,
} = Animated;

const { width: screenWidth } = Dimensions.get('window');

export interface PagerProps extends PanGestureHandlerProperties {
  index: number;
  width: number;
  onChange: (nextIndex: number) => void;
  children: any;
}

class Pager extends React.Component<PagerProps> {
  index = new Value(this.props.index);
  nextIndex = new Value(-1);
  minIndex = new Value(0);
  maxIndex = new Value(Children.count(this.props.children) - 1);

  clock = new Clock();
  gesture = new Value(0);

  vx = new Value(0);
  dragX = new Value(0);

  dx = new Value(this.props.width * this.props.index * -1);
  translateX = new Value(0) as Animated.Node<number>;

  static defaultProps = {
    width: screenWidth,
  };

  state = {
    initialIndex: this.props.index,
  };

  runSpring = (
    index: Animated.Node<number>,
    current: Animated.Node<number>,
    width: number
  ) => {
    const state = {
      finished: new Value(0),
      velocity: new Value(0),
      position: new Value(0),
      time: new Value(0),
    };

    const config = {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      toValue: new Value(0),
    };

    return block([
      cond(
        clockRunning(this.clock),
        [0],
        [
          [
            set(state.finished, 0),
            set(state.time, 0),
            set(state.velocity, 0),
            set(state.position, current),
            set(config.toValue, multiply(index, width, -1)),
            set(this.index, index),
            startClock(this.clock),
          ],
        ]
      ),
      spring(this.clock, state, config),
      cond(state.finished, [
        set(this.dragX, 0),
        set(this.vx, 0),
        stopClock(this.clock),
      ]),

      state.position,
    ]);
  };

  constructor(props: PagerProps) {
    super(props);

    const active = new Value(0);

    const offset = new Value(0);

    const percentDragged = divide(this.dragX, props.width);
    const threshold = 0.2;

    const isRight = lessOrEq(percentDragged, -threshold);
    const isLeft = greaterOrEq(percentDragged, threshold);

    const snapIndex = new Value(this.props.index);
    const clampedSnap = min(max(snapIndex, this.minIndex), this.maxIndex);

    this.translateX = block([
      onChange(this.index, [
        call([this.index], ([index]) => this.props.onChange(index)),
      ]),

      onChange(this.nextIndex, [
        cond(neq(this.nextIndex, -1), [
          cond(clockRunning(this.clock), stopClock(this.clock)),
          set(this.index, this.nextIndex),
          set(this.nextIndex, -1),
          set(snapIndex, this.index),
        ]),
      ]),

      // onChange(snapIndex, [
      //   cond(lessThan(snapIndex, this.minIndex), [
      //     call([snapIndex], ([snapIndex]) => this.props.onExit(snapIndex)),
      //   ]),

      //   cond(greaterOrEq(snapIndex, this.maxIndex), [
      //     call([snapIndex], ([snapIndex]) => this.props.onExit(snapIndex)),
      //   ]),
      // ]),

      cond(
        eq(this.gesture, State.ACTIVE),
        [
          // this is key -- set the starting position of screen when starting to swipe
          // https://github.com/react-native-community/react-native-tab-view/blob/master/src/Pager.tsx#L507
          cond(active, [0], [set(offset, this.dx)]),
          set(active, 1),
          set(this.dx, add(offset, this.dragX)),
          set(
            snapIndex,
            add(this.index, cond(isRight, 1, cond(isLeft, -1, 0)))
          ),
          stopClock(this.clock),
        ],
        [
          set(active, 0),
          set(this.dx, this.runSpring(clampedSnap, this.dx, props.width)),
        ]
      ),
      this.dx,
    ]);
  }

  handlePan = event(
    [
      {
        nativeEvent: {
          translationX: this.dragX,
          velocityX: this.vx,
        },
      },
    ],
    { useNativeDriver: true }
  );

  handleStateChange = event(
    [
      {
        nativeEvent: {
          state: this.gesture,
        },
      },
    ],
    { useNativeDriver: true }
  );

  componentDidUpdate(prevProps: PagerProps) {
    if (prevProps.index !== this.props.index) {
      // prevents infinite loop between pages on rapid index changes
      // theres some weird behaviour when setting values imperatively
      requestAnimationFrame(() => {
        this.nextIndex.setValue(this.props.index as any);
      });
    }

    if (prevProps.children.length !== this.props.children.length) {
      requestAnimationFrame(() => {
        this.maxIndex.setValue(Children.count(this.props.children) - 1);
      });
    }
  }

  render() {
    const { children, width, ...rest } = this.props;
    const { initialIndex } = this.state;

    return (
      <PanGestureHandler
        {...rest}
        onGestureEvent={this.handlePan}
        onHandlerStateChange={this.handleStateChange}
      >
        <Animated.View style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              transform: [{ translateX: this.translateX }] as any,
            }}
          >
            {Children.map(children, (element: any, index: number) => (
              <Page index={index} width={width} initial={initialIndex}>
                {element}
              </Page>
            ))}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

function Page({ children, index, width, initial }: any) {
  const translateX = multiply(index, width);
  // on mount the last child appears first because of absolute positioning
  const zIndex = index === 0 ? 2 : 1;

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        zIndex,
        transform: [{ translateX }] as any,
      }}
    >
      {children}
    </Animated.View>
  );
}

export { Pager };
