import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  Easing,
  Dimensions,
} from "react-native";
const { width, height } = Dimensions.get("window");

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
    this.animatedValue2 = new Animated.Value(0);
    this.animatedValue3 = new Animated.Value(0);
    setTimeout(() => {
      this.props.navigation.navigate("LoginScreen");
    }, 5000);
  }

  componentDidMount = async () => {
    await Animated.spring(this.animatedValue, {
      toValue: 1,
      friction: 2.5,
      delay: 500,
    }).start();

    await Animated.timing(this.animatedValue2, {
      toValue: 1,
      delay: 200,
      duration: 2500,
    }).start();
    await Animated.timing(this.animatedValue3, {
      toValue: 1,
      delay: 200,
      duration: 2500,
    }).start();
  };

  render() {
    const truckStyle = {
      transform: [{ scale: this.animatedValue }],
    };

    const scaleText = {
      transform: [{ scale: this.animatedValue2 }],
    };

    const scaleText2 = {
      transform: [{ scale: this.animatedValue3 }],
    };

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.ring, truckStyle]}>
          <Animated.Image
            source={require("../assets/icon.png")}
            style={[
              {
                resizeMode: "contain",
                width: 200,
                height: 200,
              },
            ]}
          />
        </Animated.View>

        <Animated.View style={scaleText2}>
          <Animated.Text style={styles.welcome}>Granny</Animated.Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 20,
              width: width / 2,
              height: 4,
              backgroundColor: "blue",
              borderRadius: 4,
            },
            scaleText,
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#99FF99",
  },
  welcome: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 30,
    color: "brown",
    fontWeight: "bold",
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  ring: {
    backgroundColor: "#40C4FF",
    borderRadius: 150,
    borderWidth: 2,
    borderColor: "#FFF",
    padding: 7,
  },
  starStyle: {
    width: 100,
    height: 20,
    marginBottom: 20,
  },
});
