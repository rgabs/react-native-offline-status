import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  NetInfo,
  View,
  StatusBar,
  Animated,
  Easing,
  AppState
} from "react-native";
import styles from "./index.styles";

export default class OfflineBar extends Component {
  static propTypes = {
    offlineText: PropTypes.string
  };

  animationConstants = {
    DURATION: 800,
    TO_VALUE: 4,
    INPUT_RANGE: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
    OUTPUT_RANGE: [0, -15, 0, 15, 0, -15, 0, 15, 0]
  };

  setNetworkStatus = status => {
    this.setState({ isConnected: status });
    if (status) {
      this.triggerAnimation();
    }
  };

  state = {
    isConnected: true
  };
  _handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      NetInfo.isConnected.fetch().then(this.setNetworkStatus);
    }
  };
  componentWillMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.setNetworkStatus
    );
    AppState.addEventListener("change", this._handleAppStateChange);
    this.animation = new Animated.Value(0);
  }
  componentWillUnMount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.setNetworkStatus
    );
    AppState.removeEventListener("change", this._handleAppStateChange);
  }
  // Took Reference from https://egghead.io/lessons/react-create-a-button-shake-animation-in-react-native#/tab-code
  triggerAnimation = () => {
    this.animation.setValue(0);
    Animated.timing(this.animation, {
      duration: this.animationConstants.DURATION,
      toValue: this.animationConstants.TO_VALUE,
      useNativeDriver: true,
      ease: Easing.bounce
    }).start();
  };

  render() {
    const interpolated = this.animation.interpolate({
      inputRange: this.animationConstants.INPUT_RANGE,
      outputRange: this.animationConstants.OUTPUT_RANGE
    });
    const animationStyle = {
      transform: [{ translateX: interpolated }]
    };
    const { offlineText = "You are not connected to Internet" } = this.props;
    return !this.state.isConnected ? (
      <View style={[styles.container]}>
        <StatusBar backgroundColor="#424242" />
        <Animated.Text style={[styles.offlineText, animationStyle]}>
          {offlineText}
        </Animated.Text>
      </View>
    ) : null;
  }
}
