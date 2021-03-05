import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Share,
  Image,
  TouchableOpacity,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import { ListItem, Icon, SearchBar, Tile } from "react-native-elements";
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
          this.updateBadge();
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
      <Tile
        onPress={() => {
          this.props.navigation.navigate("ViewScreen", {
            Details: item,
          });
        }}
        imageSrc={{ uri: item.Image }}
        title={item.Dish}
        featured
        caption={item.Description}
        titleStyle={{
          position: "absolute",
          bottom: 30,
          left: 1,
          color: "white",

          color: "#FFFFFF",
          paddingLeft: 10,
          paddingRight: 30,
          textShadowColor: "#585858",
          textShadowOffset: { width: 5, height: 5 },
          textShadowRadius: 10,
        }}
        captionStyle={{
          position: "absolute",
          bottom: 10,
          left: 10,
          color: "white",

          color: "#FFFFFF",
          paddingLeft: 1,
          paddingRight: 30,
          textShadowColor: "#585858",
          textShadowOffset: { width: 5, height: 5 },
          textShadowRadius: 10,
        }}
        contentContainerStyle={{ height: 70, position: "absolute", bottom: 10 }}
      />
    );
  };

  filterSearch(text) {
    if (text) {
      const newData = this.state.list.filter((item) => {
        var f = text.charAt(0).toUpperCase() + text.slice(1).toUpperCase();
        if (
          f === "B" ||
          f === "BR" ||
          f === "BRE" ||
          f === "BREA" ||
          f === "BREAK" ||
          f === "BREAKF" ||
          f === "BREAKFA" ||
          f === "BREAKFAS" ||
          f === "BREAKFAST"
        ) {
          const itemData = item.Time.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        } else if (
          f === "L" ||
          f === "LU" ||
          f === "LUN" ||
          f === "LUNC" ||
          f === "LUNCH"
        ) {
          const itemData = item.Time.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        } else if (
          f === "S" ||
          f === "SN" ||
          f === "SNA" ||
          f === "SNAC" ||
          f === "SNACK"
        ) {
          const itemData = item.Time.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        } else if (
          f === "D" ||
          f === "DI" ||
          f === "DIN" ||
          f === "DINN" ||
          f === "DINNE" ||
          f === "DINNER"
        ) {
          const itemData = item.Time.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        } else {
          const itemData = item.Dish.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        }
      });
      this.setState({
        search: text,
        list: newData,
      });
    } else {
      this.getRequestedItemsList();
    }
  }

  goToTop = () => {
    this.scroll.scrollTo({ x: 0, y: 0, animated: true });
  };

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Recipes" navigation={this.props.navigation} />
        <ScrollView
          ref={(c) => {
            this.scroll = c;
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "magenta" }}>
              <SearchBar
                labelStyle={{ fontWeight: "bold" }}
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
                <Text>No Recipes Uploaded</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: "#E1CAF7" }}>
                <FlatList
                  keyExtractor={this.keyExtractor}
                  data={this.state.list}
                  renderItem={this.renderItem}
                  style={{ marginBottom: 100 }}
                />
              </View>
            )}
          </View>
        </ScrollView>
        <View
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Icon
            name="plus"
            size={20}
            color="white"
            type="font-awesome"
            containerStyle={{
              width: 50,
              backgroundColor: "green",
              height: 50,
              alignItems: "center",
              justifyContent: "center",
              shadowOpacity: 10.44,
              shadowRadius: 70.32,
              elevation: 20,
              alignSelf: "center",
              color: "white",
              borderRadius: 100,
            }}
            onPress={() => {
              this.props.navigation.navigate("Add");
            }}
          />
        </View>

        <View
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Icon
            name="angle-double-up"
            size={35}
            color="white"
            type="font-awesome"
            containerStyle={{
              width: 40,
              backgroundColor: "green",
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              shadowOpacity: 10.44,
              shadowRadius: 70.32,
              elevation: 20,
              alignSelf: "center",
              color: "white",
              borderRadius: 100,
            }}
            onPress={this.goToTop}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "#E1CAF7",
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
    backgroundColor: "#FF6666",
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
