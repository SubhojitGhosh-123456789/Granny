import React from "react";
import { StyleSheet, Text, View, ToastAndroid, Image } from "react-native";
import { Card, Avatar, Input } from "react-native-elements";
import db from "../config";
import firebase from "firebase";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import MyHeader from "../components/AppHeader";
import * as ImagePicker from "expo-image-picker";
import { RFValue } from "react-native-responsive-fontsize";

export default class SettingsScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      username: firebase.auth().currentUser.displayName,
      phone: "",
      email: firebase.auth().currentUser.email,
      password: "",
      docId: "",
      surname: "",
      recipes: "",
      image: "#",
      rating: "",
      cookr: "",
      no: [],
      badge: "",
    };
  }

  componentDidMount() {
    this.getDetails(this.state.email);
    this.getCookRating();
    this.updateBadge();
  }

  getCookRating = async () => {
    await firebase
      .firestore()
      .collection("Recipes")
      .where("Email", "==", firebase.auth().currentUser.email)
      .where("UserName", "==", firebase.auth().currentUser.displayName)
      .onSnapshot((snapshot) => {
        var recipes = snapshot.docs.map((document) => document.data());
        this.setState({ no: recipes });
        console.log(this.state.no);

        var rating = [];

        this.state.no.map((item) => {
          rating.push(item.Rating);
          console.log(rating);

          var sum = 0;
          for (var i = 0; i < rating.length; i++) {
            sum += rating[i];
          }

          var avg = Math.round(sum * 100) / 100 / rating.length;

          console.log(
            "The sum of all the elements is: " + sum + " The average is: " + avg
          );

          this.setState({ cookr: avg });
          this.updateCookRating();
        });
      });
  };

  updateCookRating = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", firebase.auth().currentUser.email)
      .where("Name", "==", firebase.auth().currentUser.displayName)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          firebase.firestore().collection("Users").doc(doc.id).update({
            Rating: this.state.cookr,
          });
        });
      });
  };
  updateBadge = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", firebase.auth().currentUser.email)
      .where("Name", "==", firebase.auth().currentUser.displayName)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.data().Rating);
          var r = doc.data().Rating;

          if (r >= 4.9) {
            console.log("1");
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge:
                "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2F1_50x50.jpg?alt=media&token=6b53856d-2dec-488f-93fa-9ab7f36d062f",
            });
          } else if (r >= 4.5) {
            console.log("2");
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge:
                "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2F2_50x50.jpg?alt=media&token=5c4ed81a-b1af-4c7b-bdb7-44ff4a5275f8",
            });
          } else if (r > 3.9) {
            console.log("3");
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge:
                "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2F3_50x50.jpg?alt=media&token=255de567-a139-4a47-becc-26c78e21cd46",
            });
          } else {
            console.log("Amateur");
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge: "#",
            });
          }
        });
      });
  };

  getDetails = async (text) => {
    const ref = await firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", this.state.email)
      .where("Name", "==", this.state.username)
      .get();

    ref.docs.map((doc) => {
      var user = doc.data();
      this.setState({
        phone: user.Phone,
        password: user.Password,
        docId: doc.id,
        surname: user.Surname,
        recipes: user.RecipesCreated,
        rating: user.Rating,
        image: user.Image,
        badge: user.Badge,
      });
    });
  };

  updateProfile = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .doc(this.state.docId)
      .update({
        Name: this.state.username,
        Email: this.state.email,
        Password: this.state.password,
        Phone: this.state.phone,
        Image: this.state.image,
      });

    var user = firebase.auth().currentUser;

    user.updatePassword(this.state.password);

    ToastAndroid.show(
      "Your Profile Has Been Successfully Updated",
      ToastAndroid.SHORT
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Settings" navigation={this.props.navigation} />
        <ScrollView>
          <View
            style={{
              justifyContent: "center",
              flex: 1,
              alignContent: "center",
            }}
          >
            <Card borderRadius={20} containerStyle={styles.card}>
              <View style={{ backgroundColor: "#33867E", borderRadius: 20 }}>
                <Avatar
                  rounded
                  source={{ uri: this.state.image }}
                  size={150}
                  containerStyle={{
                    alignSelf: "center",
                    marginBottom: 20,
                    marginTop: 20,
                  }}
                />
                <Text
                  style={{
                    fontWeight: "bold",
                    alignSelf: "center",
                    marginBottom: 20,
                    color: "white",
                  }}
                >
                  {this.state.username} {this.state.surname}
                </Text>
              </View>

              <Image
                source={{ uri: this.state.badge }}
                style={{
                  width: 45,
                  height: 50,
                  alignSelf: "center",
                }}
              />
              <Card.Divider />
              <Card.Title>Personal Information</Card.Title>
              <Card.Divider />
              <Input
                label="Your Email Address"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                style={{
                  marginTop: RFValue(22),
                }}
                placeholder=" Email"
                placeholderTextColor="gray"
                disabled={true}
                value={this.state.email}
              />
              <Input
                label="Your Mobile Number"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                placeholder=" Phone Number"
                placeholderTextColor="gray"
                onChangeText={(text) => this.setState({ phone: text })}
                value={this.state.phone}
                containerStyle={{ marginTop: 20 }}
              />
              <Input
                label="Your Password"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                placeholder=" Password"
                placeholderTextColor="gray"
                onChangeText={(text) => this.setState({ password: text })}
                value={this.state.password}
              />
              <Card.Divider />
              <Card.Title>Granny's Report Card</Card.Title>
              <Card.Divider />
              <Text
                style={{
                  fontWeight: "200",
                  fontSize: 15,
                }}
              >
                Recipes Created: {this.state.recipes} recipes
              </Text>
              <Text
                style={{
                  fontWeight: "200",
                  fontSize: 15,
                  marginTop: 10,
                }}
              >
                Rating : {this.state.rating}/5
              </Text>
              <Card.Divider />
            </Card>
            <TouchableOpacity
              style={styles.button}
              onPress={this.updateProfile}
            >
              <Text
                style={{ color: "white", fontSize: 20, textAlign: "center" }}
              >
                UPDATE PROFILE
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
  },
  inputBox: {
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 5,
    textAlign: "center",
    backgroundColor: "white",
    width: 170,
  },
  textArea: {
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 10,
    textAlign: "center",
    height: RFValue(3.2),
    backgroundColor: "white",
  },
  button: {
    width: 250,
    backgroundColor: "#FF8000",
    height: 50,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: RFValue(34),
    shadowOpacity: 0.44,
    shadowRadius: 50.32,
    elevation: 16,
    alignSelf: "center",
    color: "white",
  },
  buttonText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    alignContent: "center",
    justifyContent: "center",
  },
});
