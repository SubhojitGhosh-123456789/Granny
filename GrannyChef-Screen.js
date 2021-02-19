import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Share,
  Modal,
  Image,
} from "react-native";
import { Card, Icon, ListItem, Avatar, SearchBar } from "react-native-elements";
import db from "../config.js";
import firebase from "firebase";
import MyHeader from "../components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";

export default class GrannyChefScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();
    this.state = {
      list: [],
      list2: [],
      search: "",
      isModalVisible: false,

      name: "",
      phone: "",
      email: "",
      surname: "",
      recipes: "",
      image: "#",
      rating: "",
      badge: "",
      no: [],
      cookr: "",
    };
  }

  showProfile() {
    return (
      <Modal
        borderRadius={5}
        animationType="fade"
        transparent={true}
        visible={this.state.isModalVisible}
        onRequestClose={() => {
          this.setState({ isModalVisible: false });
        }}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: "100%", height: "100%" }}>
            <View style={styles.inputView}>
              <View style={styles.modalView}>
                <View style={{ flex: 1, marginBottom: 30 }}>
                  <Card borderRadius={20}>
                    <Avatar
                      rounded
                      source={{ uri: this.state.image }}
                      size={150}
                      containerStyle={{
                        alignSelf: "center",
                        marginBottom: 20,
                      }}
                    />
                    <Text
                      style={{
                        fontWeight: "bold",
                        alignSelf: "center",
                        marginBottom: 20,
                      }}
                    >
                      {this.state.name} {this.state.surname}
                    </Text>
                    <Image
                      source={{ uri: this.state.badge }}
                      style={{
                        width: 45,
                        height: 50,
                        alignSelf: "center",
                      }}
                    />
                    <Card.Divider />
                    <Card.Title>Contact Details</Card.Title>
                    <Card.Divider />
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Email: {this.state.email}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                        marginTop: 10,
                      }}
                    >
                      Mobile Number: {this.state.phone}
                    </Text>
                    <Card.Divider />
                    <Card.Title>Granny's Report</Card.Title>
                    <Card.Divider />
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Recipes Created: {this.state.recipes} recipes
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                        marginTop: 10,
                      }}
                    >
                      Rating : {this.state.rating}/5
                    </Text>
                    <Card.Divider />
                    <Card.Title>Recipes</Card.Title>
                    {this.state.list.length === 0 ? (
                      <View style={styles.subContainer}>
                        <Text>No Recipes Made Until Now</Text>
                      </View>
                    ) : (
                      <FlatList
                        keyExtractor={this.keyExtractor2}
                        data={this.state.list2}
                        renderItem={this.renderItem2}
                      />
                    )}
                  </Card>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
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

  filterSearch(text) {
    if (text) {
      const newData = this.state.list.filter((item) => {
        const itemData = item.Name.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({
        search: text,
        list: newData,
      });
    } else {
      this.getChefList();
    }
  }

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

  getDetails = async (email) => {
    const ref = await firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", email)
      .get();

    ref.docs.map((doc) => {
      var user = doc.data();
      this.setState({
        name: user.Name,
        surname: user.Surname,
        email: user.Email,
        phone: user.Phone,
        surname: user.Surname,
        recipes: user.RecipesCreated,
        rating: user.Rating,
        image: user.Image,
        badge: user.Badge,
      });
    });

    await firebase
      .firestore()
      .collection("Recipes")
      .where("Email", "==", email)
      .onSnapshot((snapshot) => {
        var requestedItemList = snapshot.docs.map((document) =>
          document.data()
        );
        this.setState({ list2: requestedItemList });
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

  keyExtractor2 = (item, index) => index.toString();

  renderItem2 = ({ item, i }) => {
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
        <Avatar
          rounded
          source={{ uri: item.Image }}
          size={70}
          containerStyle={{
            alignSelf: "center",
            marginBottom: 20,
          }}
        />
        <ListItem.Content>
          <ListItem.Title style={{ fontWeight: "bold" }}>
            {item.Dish}
          </ListItem.Title>
          <ListItem.Subtitle>{item.Description}</ListItem.Subtitle>
          <Text>
            By {item.UserName} {item.Surname}
          </Text>
        </ListItem.Content>
        <View>
          <Icon
            name="share"
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
              elevation: 16,
              alignSelf: "center",
              color: "white",
              borderRadius: 10,
            }}
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
            containerStyle={{
              marginLeft: 10,
              marginTop: 10,
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
            }}
            onPress={() => {
              this.saveRecipe(item.RecipeID, item.Dish, item.UserName);
              alert(
                "Thank You For Saving " +
                  item.UserName +
                  " " +
                  this.state.surname +
                  "'s recipe " +
                  item.Dish
              );
            }}
          />
        </View>
      </ListItem>
    );
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => {
    return (
      <ListItem
        key={i}
        bottomDivider
        underlayColor="transparent"
        containerStyle={{ borderRadius: 15, elevation: 20, margin: 5 }}
        onPress={() => {
          this.getDetails(item.Email);
          this.setState({ isModalVisible: true });
        }}
      >
        <Avatar
          rounded
          source={{ uri: item.Image }}
          size={70}
          containerStyle={{
            backgroundColor: "#1182C6",
            borderRadius: 100,
            alignSelf: "center",
          }}
        />
        <ListItem.Content>
          <ListItem.Title>
            {item.Name} {item.Surname}
          </ListItem.Title>
          <ListItem.Subtitle>{item.Rating}/5</ListItem.Subtitle>
        </ListItem.Content>
        <View>
          <Icon
            name="share"
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
              elevation: 16,
              alignSelf: "center",
              color: "white",
              borderRadius: 10,
            }}
            onPress={() => {
              console.log("Shared");
              this.share(
                "Check Out " +
                  item.Name +
                  " " +
                  item.Surname +
                  "'s Recipes who has been rated " +
                  item.Rating +
                  "/5. Download Granny now!!"
              );
            }}
          />
        </View>
      </ListItem>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Granny's Chefs" navigation={this.props.navigation} />
        <ScrollView>
          <View>{this.showProfile()}</View>
          <View style={{ flex: 1, backgroundColor: "magenta" }}>
            <SearchBar
              placeholder="Search A Chef"
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
            <FlatList
              keyExtractor={this.keyExtractor}
              data={this.state.list}
              renderItem={this.renderItem}
            />
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
