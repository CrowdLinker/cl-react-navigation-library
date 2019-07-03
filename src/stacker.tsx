import React, { Component, Children } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerProperties,
} from 'react-native-gesture-handler';

const {
  event,
  block,
  Value,
  divide,
  lessOrEq,
  greaterOrEq,
  cond,
  eq,
  add,
  stopClock,
  Clock,
  set,
  clockRunning,
  spring,
  startClock,
  multiply,
  lessThan,
  onChange,
  debug,
  neq,
  sub,
  greaterThan,
  call,
  and,
} = Animated;

const { width: screenWidth } = Dimensions.get('window');

interface StackerProps {
  index: number;
  onChange: (nextIndex: number) => void;
  width: number;
}

class Stacker extends Component<StackerProps & PanGestureHandlerProperties> {
  dragX = new Value(0);
  vx = new Value(0);
  gesture = new Value(0);
  dx = new Value(0);
  clock = new Clock();

  nextIndex = new Value(-1);

  index = new Value(this.props.index);
  translateX = new Value(0) as Animated.Node<number>;

  static defaultProps = {
    width: screenWidth,
    enabled: true,
  };

  runSpring = (index: any) => {
    const state = {
      finished: new Value(0),
      velocity: new Value(0),
      position: this.dragX,
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
            set(state.velocity, this.vx),
            set(config.toValue, 0),
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

  constructor(props) {
    super(props);

    const percentDragged = divide(this.dragX, props.width);
    const threshold = 0.2;

    const isRight = lessOrEq(percentDragged, -threshold);
    const isLeft = greaterOrEq(percentDragged, threshold);

    const snapIndex = new Value(this.props.index);

    this.translateX = block([
      onChange(this.index, [
        call([this.index], ([index]) => this.props.onChange(index)),
      ]),

      onChange(this.nextIndex, [
        cond(and(neq(this.nextIndex, -1), neq(this.nextIndex, this.index)), [
          cond(clockRunning(this.clock), stopClock(this.clock)),
          set(this.dragX, 0),
          set(this.index, this.nextIndex),
          set(this.nextIndex, -1),
          set(snapIndex, this.index),
        ]),
      ]),

      cond(
        eq(this.gesture, State.ACTIVE),
        [
          cond(
            greaterThan(this.dragX, 0),
            [
              set(this.dx, this.dragX),
              set(
                snapIndex,
                add(this.index, cond(isRight, 1, cond(isLeft, -1, 0)))
              ),
              stopClock(this.clock),
            ],
            [set(this.dragX, 0)]
          ),
        ],

        set(this.dx, this.runSpring(snapIndex))
      ),

      this.dx,
    ]);
  }

  handlePan = event(
    [
      {
        nativeEvent: {
          translationX: (x: any) =>
            block([cond(greaterThan(x, 0), set(this.dragX, x))]),
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

  componentDidUpdate(prevProps) {
    if (prevProps.index !== this.props.index) {
      requestAnimationFrame(() => {
        this.nextIndex.setValue(this.props.index as any);
      });
    }
  }

  render() {
    const { index, children, width, enabled, ...rest } = this.props;

    return (
      <PanGestureHandler
        {...rest}
        enabled={enabled && index > 0}
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
            {Children.map(children, (element: any, index: number) => {
              return (
                <StackScreen
                  activeIndex={this.index}
                  index={index}
                  width={width}
                  dx={this.translateX}
                >
                  {element}
                </StackScreen>
              );
            })}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

function getOffset(index: any, activeIndex: any) {
  if (index < activeIndex) {
    return -0.3;
  }

  if (index === activeIndex) {
    return 0;
  }

  return 1;
}

interface StackScreenProps {
  activeIndex: Animated.Value<number>;
  index: number;
  width: number;
  dx: Animated.Node<number>;
}

class StackScreen extends Component<StackScreenProps> {
  translateX = new Value(0);
  index = new Value(this.props.index);
  clock = new Clock();
  offset = new Value(
    getOffset(this.props.index, this.props.activeIndex) * this.props.width
  );

  left = new Value(-0.3);
  right = new Value(1);

  constructor(props) {
    super(props);

    this.translateX = this.computeTranslateX(
      props.activeIndex,
      props.dx
    ) as any;
  }

  computeTranslateX = (activeIndex: any, dx: any) => {
    const delta = sub(this.index, activeIndex);

    const clamped = cond(
      lessThan(delta, 0),
      this.left,
      cond(eq(delta, 0), 0, this.right)
    );

    const offset = multiply(clamped, this.props.width);

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
        [
          cond(neq(config.toValue, offset), [
            set(state.finished, 0),
            set(state.time, 0),
            set(config.toValue, offset),
          ]),
        ],
        [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, this.offset),
          set(config.toValue, offset),
          startClock(this.clock),
        ]
      ),

      spring(this.clock, state, config),

      cond(state.finished, [
        set(this.offset, state.position),
        stopClock(this.clock),
      ]),

      // required to compute offsets from change in activeIndex
      onChange(dx, []),

      cond(
        lessThan(this.offset, 0),
        sub(state.position, this.props.dx),
        state.position
      ),
    ]);
  };

  render() {
    return (
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX: this.translateX }] as any,
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

export { Stacker };
