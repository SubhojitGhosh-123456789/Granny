import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Card, Icon, ListItem, Header } from "react-native-elements";
import db from "../config.js";
import firebase from "firebase";
import MyHeader from "../components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";

export default class MySavedRecipesScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();
    this.state = {
      userName: firebase.auth().currentUser.displayName,
      userId: firebase.auth().currentUser.email,
      allRecipes: [],
      isModalVisible: false,
      email: "",
      name: "",
      dish: "",
      ingredients: "",
      description: "",
      image: "",
      steps: "",
      surname: "",
      time: "",
      id: "",
    };
  }

  getAllRecipes = async () => {
    await firebase
      .firestore()
      .collection("SavedRecipes")
      .where("SavedEmail", "==", this.state.userId)
      .onSnapshot((snapshot) => {
        var allRecipes = snapshot.docs.map((document) => document.data());
        this.setState({
          allRecipes: allRecipes,
        });
      });
  };
  componentDidMount() {
    this.getAllRecipes();
  }

  delete = () => {};

  getRecipe = async (id) => {
    await firebase
      .firestore()
      .collection("Recipes")
      .where("RecipeID", "==", id)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.data);
          this.setState({
            dish: doc.data().Dish,
            ingredients: doc.data().Ingredients,
            steps: doc.data().Steps,
            name: doc.data().UserName,
            image: doc.data().Image,
            surname: doc.data().Surname,
            description: doc.data().Description,
            time: doc.data().Time,
          });
        });
      });
  };

  showRecipe = () => {
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
                <View style={{ flex: 1, marginBottom: 30 }}>
                  <Card borderRadius={25}>
                    <Card.Title>{this.state.dish}</Card.Title>
                    <Card.Divider />
                    <Card.Image
                      source={{ uri: this.state.image }}
                      style={{
                        width: 300,
                        height: 200,
                        alignSelf: "center",
                        borderRadius: 20,
                        marginBottom: RFValue(34),
                      }}
                      containerStyle={{
                        alignSelf: "center",
                      }}
                    />
                    <Card.Title>{this.state.description}</Card.Title>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "blue",
                        alignSelf: "center",
                      }}
                    >
                      #{this.state.time}
                    </Text>
                    <Card.Divider />
                    <Card.Title>
                      Ingredients for {this.state.dish} are: -
                    </Card.Title>
                    <Text>{this.state.ingredients}</Text>
                    <Card.Divider />
                    <Card.Title>Steps To Make It:- </Card.Title>
                    <Text>{this.state.steps}</Text>
                    <Card.Divider />
                    <View
                      style={{
                        marginBottom: RFValue(34),
                      }}
                    >
                      <Text
                        style={{
                          position: "absolute",
                          right: 0,
                          marginBottom: RFValue(34),
                          color: "gray",
                        }}
                      >
                        By {this.state.name} {this.state.surname}
                      </Text>
                    </View>
                    <Card.Divider />

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
                        elevation: 16,
                        alignSelf: "center",
                        color: "white",
                        borderRadius: 100,
                      }}
                      onPress={() => {
                        this.setState({ isModalVisible: false });
                      }}
                    />
                  </Card>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => (
    <ListItem
      key={i}
      bottomDivider
      underlayColor="transparent"
      onPress={() => {
        this.setState({ isModalVisible: true });
        console.log(this.state.isModalVisible);
        this.getRecipe(item.RecipeID);
      }}
      containerStyle={{ borderRadius: 15, margin: 10, elevation: 20 }}
    >
      <ListItem.Content>
        <ListItem.Title style={{ fontWeight: "bold" }}>
          {item.Dish}
        </ListItem.Title>
        <ListItem.Subtitle>
          Saved On {item.Date} At{item.Time}
        </ListItem.Subtitle>
      </ListItem.Content>

      <Icon
        name="trash"
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
          console.log("Delete");

          var id = "";
          firebase
            .firestore()
            .collection("SavedRecipes")
            .where("Dish", "==", item.Dish)
            .where("SavedEmail", "==", this.state.userId)
            .where("By", "==", item.By)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                console.log(doc.data);
                id = doc.id;
                console.log(id);

                firebase
                  .firestore()
                  .collection("SavedRecipes")
                  .doc(id)
                  .delete();
              });
            });
        }}
      />
    </ListItem>
  );

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Saved Recipes" navigation={this.props.navigation} />
        <View>{this.showRecipe()}</View>
        <ScrollView>
          <View style={{ flex: 1 }}>
            {this.state.allRecipes.length === 0 ? (
              <View style={styles.subtitle}>
                <Text
                  style={{
                    fontSize: 15,
                    color: "black",
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  No Saved Recipes
                </Text>
              </View>
            ) : (
              <FlatList
                keyExtractor={this.keyExtractor}
                data={this.state.allRecipes}
                renderItem={this.renderItem}
              />
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
});
