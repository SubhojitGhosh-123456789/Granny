import React, { Component } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import {
  ListItem,
  Avatar,
  SearchBar,
  Icon,
  Divider,
} from "react-native-elements";
import db from "../config.js";
import firebase from "firebase";
import MyHeader from "../components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";

export default class TopChefsScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();
    this.state = {
      list: [],
      list2: [],

      name: "",
      phone: "",
      email: "",
      surname: "",
      recipes: "",
      image: "#",
      rating: "",
      no: [],
      cookr: "",
    };
  }
  getChefList = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .orderBy("Rating", "desc")
      .onSnapshot((snapshot) => {
        var chefList = snapshot.docs.map((document) => document.data());
        this.setState({ list: chefList });
        console.log(chefList);
      });
  };

  componentDidMount() {
    this.getChefList();
    this.setState({
      name: "",
      surname: "",
      email: "",
      phone: "",
      surname: "",
      recipes: "",
      rating: "",
      image: "",
    });
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

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Top Chefs" navigation={this.props.navigation} />
        <ScrollView>
          {this.state.list.length === 0 ? (
            <View style={styles.subContainer}>
              <Text>Please Check Your Internet Connection</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: "yellow" }}>
              <Divider
                style={{
                  backgroundColor: "gray",
                  borderWidth: 2,
                  width: "100%",
                  color: "gray",
                }}
              />
              <View
                style={{
                  width: "100%",
                  backgroundColor: "yellow",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    margin: 10,
                    fontSize: 15,
                    marginLeft: 40,
                  }}
                >
                  Leaderboard
                </Text>
                <Divider
                  style={{
                    backgroundColor: "gray",
                    borderWidth: 2,
                    height: "100%",
                    color: "gray",
                    position: "absolute",
                    right: 135,
                  }}
                />
                <Text
                  style={{
                    fontWeight: "bold",
                    margin: 10,
                    fontSize: 15,
                    position: "absolute",
                    right: 10,
                  }}
                >
                  Ranking
                </Text>
              </View>
              <Divider
                style={{
                  backgroundColor: "gray",
                  borderWidth: 2,
                  width: "100%",
                  color: "gray",
                }}
              />
              {this.state.list.map((item, index) => (
                <View>
                  <View
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      <Avatar
                        rounded
                        source={{ uri: item.Image }}
                        size={50}
                        containerStyle={{
                          backgroundColor: "#1182C6",
                          borderRadius: 100,
                          alignSelf: "center",
                        }}
                      />
                      <Text
                        style={{
                          fontWeight: "bold",
                          marginLeft: 10,
                          marginTop: 25,
                          marginBottom: 25,
                          marginRight: 25,
                          fontSize: 15,
                        }}
                      >
                        {item.Name} {item.Surname}
                      </Text>
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 5,
                        top: 25,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 15,
                          marginTop: 50,
                        }}
                      >
                        Rating : {item.Rating}/5
                      </Text>
                    </View>
                    <Divider
                      style={{
                        backgroundColor: "gray",
                        borderWidth: 2,
                        height: "100%",
                        color: "gray",
                        position: "absolute",
                        right: 135,
                      }}
                    />
                    <Image
                      source={{ uri: item.Badge }}
                      style={{
                        width: 45,
                        height: 50,
                        marginLeft: 30,
                        marginTop: 20,
                      }}
                    />

                    <View
                      style={{
                        fontWeight: "bold",
                        margin: 2,
                        fontSize: 15,
                        position: "absolute",
                        right: 10,
                      }}
                    >
                      <Icon
                        name="certificate"
                        size={50}
                        type="font-awesome"
                        color="orange"
                        containerStyle={{
                          marginTop: 14,
                        }}
                      />
                      <Text
                        style={{
                          position: "absolute",
                          alignItems: "center",
                          alignSelf: "center",
                          justifyContent: "center",
                          color: "black",
                          top: 24,
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                  </View>
                  <Divider
                    style={{
                      backgroundColor: "gray",
                      borderWidth: 2,
                      width: "100%",
                      color: "gray",
                      marginTop: 25,
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  searchBar: {
    fontSize: 24,
    margin: 10,
    width: "90%",
    height: 50,
    backgroundColor: "white",
  },

  logost: {
    fontWeight: "bold",
    fontSize: 30,
    color: "yellow",
    textAlign: "center",
    marginBottom: RFValue(34),
  },
  subContainer: {
    flex: 1,
    fontSize: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
