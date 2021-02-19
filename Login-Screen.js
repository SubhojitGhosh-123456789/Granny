import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Modal,
  Image,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import { Icon, Input, Card } from "react-native-elements";
import { RFValue } from "react-native-responsive-fontsize";
import DropDownPicker from "react-native-dropdown-picker";

export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      displayName: "",
      email: "",
      password: "",
      phone: "",
      surname: "",
      isLoading: false,
      isModalVisible: false,
      secureTextEntry: true,
      iconName: "eye",
    };
  }

  onIconPress = () => {
    let iconName = this.state.secureTextEntry ? "eye-slash" : "eye";

    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
      iconName: iconName,
    });
  };

  showRegisterScreen = () => {
    return (
      <Modal
        borderRadius={5}
        animationType="slide"
        transparent={true}
        visible={this.state.isModalVisible}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: "100%", height: "100%" }}>
            <View style={styles.inputView}>
              <View style={styles.modalView}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Text
                    style={[
                      styles.logot,
                      { marginLeft: RFValue(30), color: "brown" },
                    ]}
                  >
                    Register User
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ isModalVisible: false });
                    }}
                  >
                    <Icon
                      name="times"
                      size={30}
                      color="white"
                      type="font-awesome"
                      containerStyle={{
                        width: 50,
                        backgroundColor: "#fb5b5a",
                        height: 50,
                        alignItems: "center",
                        justifyContent: "center",
                        shadowOpacity: 0.44,
                        shadowRadius: 50.32,
                        alignSelf: "flex-end",
                        elevation: 16,
                        color: "white",
                        borderRadius: 100,
                        marginTop: RFValue(34),
                        marginLeft: 50,
                      }}
                      onPress={() => {
                        this.setState({ isModalVisible: false });
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <Card borderRadius={10}>
                  <Input
                    label="Your First Name"
                    labelStyle={{ fontWeight: "bold", color: "black" }}
                    style={{
                      marginTop: RFValue(22),
                    }}
                    placeholder=" First Name"
                    placeholderTextColor="gray"
                    onChangeText={(text) =>
                      this.setState({ displayName: text })
                    }
                    value={this.state.displayName}
                  />
                  <Input
                    label="Your Last Name"
                    labelStyle={{ fontWeight: "bold", color: "black" }}
                    style={{
                      marginTop: RFValue(22),
                    }}
                    placeholder=" Last Name"
                    placeholderTextColor="gray"
                    onChangeText={(text) => this.setState({ surname: text })}
                    value={this.state.surname}
                  />
                  <Input
                    label="Your Mobile Number"
                    labelStyle={{ fontWeight: "bold", color: "black" }}
                    style={{
                      marginTop: RFValue(22),
                    }}
                    placeholder=" Phone Number"
                    placeholderTextColor="gray"
                    onChangeText={(text) => this.setState({ phone: text })}
                    value={this.state.phone}
                  />
                  <Input
                    label="Your Email Address"
                    labelStyle={{ fontWeight: "bold", color: "black" }}
                    style={{
                      marginTop: RFValue(22),
                    }}
                    placeholder=" Email"
                    placeholderTextColor="gray"
                    onChangeText={(text) => this.setState({ email: text })}
                    value={this.state.email}
                  />
                  <Input
                    label="Your Password"
                    labelStyle={{ fontWeight: "bold", color: "black" }}
                    style={{
                      marginTop: RFValue(22),
                    }}
                    placeholder=" Password"
                    placeholderTextColor="gray"
                    onChangeText={(text) => this.setState({ password: text })}
                    value={this.state.password}
                  />
                </Card>

                <View style={styles.inputView}>
                  <TouchableOpacity
                    style={[
                      styles.loginBtn,
                      { alignSelf: "center", color: "#FF8000" },
                    ]}
                    onPress={this.registerUser}
                  >
                    <Text style={styles.loginText}>REGISTER</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  login = async (email, password) => {
    if (email && password) {
      try {
        const response = await firebase
          .auth()
          .signInWithEmailAndPassword(email, password);
        if (response) {
          ToastAndroid.show(
            "You Have Logged in Successfully!!",
            ToastAndroid.SHORT
          );
          this.setState({ email: "", password: "" });
          this.props.navigation.navigate("Drawer");
        }
      } catch (error) {
        switch (error.code) {
          case "auth/user-not-found":
            ToastAndroid.show(
              "User doesn't Exist. Please Register If You do not have an Account.",
              ToastAndroid.SHORT
            );
            this.setState({ email: "", password: "" });
            break;
          case "auth/invalid-email":
            ToastAndroid.show("Incorrect Email entered", ToastAndroid.SHORT);
            this.setState({ email: "", password: "" });
            break;
          case "auth/wrong-password":
            ToastAndroid.show("Incorrect Password entered", ToastAndroid.SHORT);
            this.setState({ email: "", password: "" });
            break;
        }
      }
    } else {
      ToastAndroid.show(
        "Please Enter Your Email and Password",
        ToastAndroid.SHORT
      );
    }
  };

  registerUser = () => {
    if (
      this.state.email !== "" &&
      this.state.password !== "" &&
      this.state.phone !== "" &&
      this.state.displayName !== "" &&
      this.state.surname !== ""
    ) {
      this.setState({ isLoading: true });

      firebase.firestore().collection("Users").add({
        Name: this.state.displayName,
        Surname: this.state.surname,
        Email: this.state.email,
        Password: this.state.password,
        Phone: this.state.phone,
        RecipesCreated: 0,
        Rating: 2,
        Image:
          "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2Fadaptive-icon.png?alt=media&token=07f00f46-3594-4012-a6cc-817a2bc66f7c",
        Badge: "#",
      });

      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((res) => {
          res.user.updateProfile({
            displayName: this.state.displayName,
          });
          ToastAndroid.show(
            "You have Registered successfully!!",
            ToastAndroid.SHORT
          );
          this.setState({
            isLoading: false,
            displayName: "",
            phone: "",
            address: "",
            surname: "",
            isModalVisible: false,
          });
        })
        .catch((error) => ToastAndroid.show(error.message), ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(
        "Please Enter All Your Details to Signup",
        ToastAndroid.SHORT
      );
    }
  };
  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <View>{this.showRegisterScreen()}</View>
          <View>
            <Image
              source={require("../assets/icon.png")}
              style={{
                width: 200,
                height: 200,
                alignSelf: "center",
                marginTop: RFValue(34),
              }}
            />
          </View>

          <Card borderRadius={5}>
            <Input
              label="Your Email Address"
              labelStyle={{ fontWeight: "bold", color: "black" }}
              style={{
                marginTop: RFValue(22),
              }}
              placeholder="Email"
              placeholderTextColor="gray"
              onChangeText={(text) => {
                this.setState({
                  email: text,
                });
              }}
              value={this.state.email}
            />
            <Input
              getRef={(input) => (this.input = input)}
              label="Your Password"
              labelStyle={{ fontWeight: "bold", color: "black" }}
              style={{
                marginTop: RFValue(22),
              }}
              rightIcon={
                <Icon
                  name={this.state.iconName}
                  color="gray"
                  size={30}
                  type="font-awesome"
                  onPress={this.onIconPress}
                />
              }
              secureTextEntry={this.state.secureTextEntry}
              placeholder="Password"
              onChangeText={(text) => {
                this.setState({
                  password: text,
                });
              }}
              value={this.state.password}
            />
          </Card>
          <View>
            <TouchableOpacity
              style={{
                width: 200,
                backgroundColor: "#FF8000",
                height: 40,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
                marginTop: RFValue(34),
                borderWidth: 2,
                borderColor: "white",
                alignSelf: "center",
              }}
              onPress={() => {
                this.login(this.state.email, this.state.password);
              }}
            >
              <Text
                style={{ textAlign: "center", color: "white", fontSize: 20 }}
              >
                LOGIN
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: RFValue(22),
              alignItems: "center",
              textAlign: "center",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Text style={styles.wText}>Do not have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                this.setState({ isModalVisible: true });
              }}
            >
              <Text
                style={[styles.wText, { color: "brown", fontWeight: "bold" }]}
              >
                {" "}
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  inputView: {
    marginBottom: 20,
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "#FCE0B1",
    borderRadius: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 20,
  },
  loginBtn: {
    width: 200,
    backgroundColor: "#FF8000",
    height: 40,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: RFValue(34),
    borderWidth: 2,
    borderColor: "white",
  },
  loginText: {
    color: "white",
    fontSize: 20,
  },
  logot: {
    fontWeight: "bold",
    fontSize: 25,
    color: "orange",
    textAlign: "center",
    marginTop: RFValue(34),
  },

  wText: {
    color: "black",
    fontSize: 15,
    textAlign: "center",
  },
});
