import React, { Component } from "react";
import { Text, View, StyleSheet, FlatList, Share, Image } from "react-native";
import db from "../config";
import firebase from "firebase";
import { ListItem, Icon, SearchBar } from "react-native-elements";
import { ScrollView } from "react-native-gesture-handler";
import MyHeader from "../components/AppHeader";
import { RFValue } from "react-native-responsive-fontsize";
import moment from "moment";

export default class RecipeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      list: [],
      surname: "",
      recipes: [],
      cookr: "",
      search: "",
    };
    this.requestRef = null;
  }

  getRequestedItemsList = async () => {
    this.requestRef = firebase
      .firestore()
      .collection("Recipes")
      .orderBy("Rating", "desc")
      .onSnapshot((snapshot) => {
        var requestedItemList = snapshot.docs.map((document) =>
          document.data()
        );
        this.setState({ list: requestedItemList });
      });
  };

  saveRecipe = (id, dish, name) => {
    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();

    var currentDate = date + "/" + month + "/" + year;

    var time = moment().utcOffset("+05:30").format(" hh:mm a");

    firebase.firestore().collection("SavedRecipes").add({
      Dish: dish,
      SavedEmail: firebase.auth().currentUser.email,
      RecipeID: id,
      Date: currentDate,
      Time: time,
      By: name,
    });
  };

  componentDidMount() {
    this.updateBadge();
    this.getCookRating();
    this.getRequestedItemsList();
  }

  getCookRating = async () => {
    await firebase
      .firestore()
      .collection("Recipes")
      .where("Email", "==", firebase.auth().currentUser.email)
      .where("UserName", "==", firebase.auth().currentUser.displayName)
      .onSnapshot((snapshot) => {
        var recipes = snapshot.docs.map((document) => document.data());
        this.setState({ recipes: recipes });
        console.log(this.state.recipes);

        var rating = [];

        this.state.recipes.map((item) => {
          rating.push(item.Rating);
          console.log(rating);

          var sum = 0;
          for (var i = 0; i < rating.length; i++) {
            sum += parseInt(rating[i], 10);
          }

          var avg = sum / rating.length;

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
  share = async (message) => {
    try {
      const result = await Share.share({
        message: message,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          Share.open(result);
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => {
    return (
      <ListItem
        key={i}
        bottomDivider
        underlayColor="transparent"
        containerStyle={{ borderRadius: 15, margin: 10, elevation: 20 }}
        onPress={() => {
          this.props.navigation.navigate("ViewScreen", {
            Details: item,
          });
        }}
      >
        <Image
          style={{
            width: 100,
            height: 150,
            borderRadius: 20,
          }}
          source={{ uri: item.Image }}
        />
        <ListItem.Content>
          <ListItem.Title style={{ fontWeight: "bold" }}>
            {item.Dish}
          </ListItem.Title>
          <ListItem.Subtitle>{item.Description}</ListItem.Subtitle>
          <Text style={{ fontWeight: "bold", color: "blue" }}>
            #{item.Time}
          </Text>
        </ListItem.Content>
        <View>
          <Icon
            name="share"
            size={30}
            color="white"
            type="font-awesome"
            containerStyle={styles.button}
            onPress={() => {
              console.log("Shared");
              this.share(
                "Check Out " +
                  item.UserName +
                  " " +
                  item.Surname +
                  "'s recipe " +
                  item.Dish +
                  " By Downloading Granny now!! Here is the image of the recipe " +
                  item.Image
              );
            }}
          />

          <Icon
            name="bookmark"
            size={30}
            color="white"
            type="font-awesome"
            containerStyle={[styles.button, { marginLeft: 10, marginTop: 10 }]}
            onPress={() => {
              this.saveRecipe(item.RecipeID, item.Dish, item.UserName);
              alert(
                "Thank You For Saving " +
                  item.UserName +
                  " " +
                  item.Surname +
                  "'s recipe " +
                  item.Dish
              );
            }}
          />
        </View>
      </ListItem>
    );
  };

  filterSearch(text) {
    if (text) {
      const newData = this.state.list.filter((item) => {
        const itemData = item.Time.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({
        search: text,
        list: newData,
      });
    } else {
      this.getRequestedItemsList();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Recipes" navigation={this.props.navigation} />
        <ScrollView>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "magenta" }}>
              <SearchBar
                lightTheme
                placeholder="Dish Or Meal Time"
                onChangeText={(text) => {
                  this.setState({ search: text });
                  this.filterSearch(text);
                }}
                value={this.state.search}
              />
            </View>
            {this.state.list.length === 0 ? (
              <View style={styles.subContainer}>
                <Text>Please Check Your Internet Connection</Text>
              </View>
            ) : (
              <View>
                <FlatList
                  keyExtractor={this.keyExtractor}
                  data={this.state.list}
                  renderItem={this.renderItem}
                />
              </View>
            )}
          </View>
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
    backgroundColor: "#99FF99",
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
  button: {
    width: 50,
    backgroundColor: "#fb5b5a",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.44,
    shadowRadius: 50.32,
    elevation: 16,
    alignSelf: "center",
    color: "white",
    borderRadius: 10,
  },
});
