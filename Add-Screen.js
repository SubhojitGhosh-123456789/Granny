import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import MyHeader from "../components/AppHeader";
import { Icon, Input, Card, Avatar } from "react-native-elements";
import { RFValue } from "react-native-responsive-fontsize";
import { ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";

export default class AddScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      username: firebase.auth().currentUser.displayName,
      dish: "",
      description: "",
      ingredients: "",
      steps: "",
      image: "#",
      isModalVisible: false,
      done: false,
      recipes: 0,
      doc: "",
      surname: "",
      time: "",
    };
  }

  createRecipeId() {
    return Math.random().toString(36).substring(7);
  }

  getNo = () => {
    firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.data);
          this.setState({
            recipes: doc.data().RecipesCreated,
            doc: doc.id,
            surname: doc.data().Surname,
          });
        });
      });
  };

  componentDidMount() {
    this.getNo();
  }

  request = async (itemName, description, ingredients, steps) => {
    var email = this.state.userId;
    var username = this.state.username;
    var recipeId = this.createRecipeId();

    if (
      this.state.dish !== "" &&
      this.state.ingredients !== "" &&
      this.state.image !== "" &&
      this.state.steps !== "" &&
      this.state.description !== "" &&
      this.state.time !== ""
    ) {
      ToastAndroid.show(
        "Please Wait For A few minutes until we upload the details.",
        ToastAndroid.LONG
      );
      this.setState({ isModalVisible: true });

      await this.uploadImage(this.state.image, this.state.dish);
    } else {
      ToastAndroid.show("Please Add All The Details", ToastAndroid.SHORT);
    }
  };

  load() {
    return (
      <Modal
        borderRadius={5}
        animationType="slide"
        transparent={true}
        visible={this.state.isModalVisible}
      >
        <Card borderRadius={10}>
          <Card.Title>Uploading....</Card.Title>

          <View style={{ flexDirection: "row" }}>
            <ActivityIndicator size={30} color="orange" />
            <Text>Please Wait</Text>
          </View>
        </Card>
      </Modal>
    );
  }

  selectPicture = async () => {
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!cancelled) {
      this.setState({ image: uri });
    }
  };

  uploadImage = async (uri, imageName) => {
    var recipeId = this.createRecipeId();
    var response = await fetch(uri);
    var blob = await response.blob();

    var username = this.state.username;
    var dish = this.state.dish;
    var description = this.state.description;
    var userId = this.state.userId;
    var ingredients = this.state.ingredients;
    var steps = this.state.steps;
    var surname = this.state.surname;
    var time = this.state.time;

    this.getNo();

    var recipes = this.state.recipes;
    var doc = this.state.doc;

    var uploadTask = firebase
      .storage()
      .ref()
      .child("UserProfiles/" + this.state.userId + "/" + imageName)
      .put(blob);

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        console.log("Upload is " + progress + "% done");

        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is Running");
            break;
          case firebase.storage.TaskState.SUCCESS: // or 'success'
            console.log("Upload is Successful");
            break;
        }
      },
      function (error) {
        console.log("Error");
      },
      function () {
        var downloadURL = uploadTask.snapshot.ref
          .getDownloadURL()
          .then((downloadUrl) => {
            var url = downloadUrl;

            console.log(username);
            console.log(dish);
            console.log(description);
            console.log(userId);
            console.log(ingredients);
            console.log(steps);
            console.log(url);

            firebase.firestore().collection("Recipes").add({
              UserName: username,
              Dish: dish,
              Description: description,
              RecipeID: recipeId,
              Email: userId,
              Ingredients: ingredients,
              Steps: steps,
              Image: url,
              Surname: surname,
              Rating: 2,
              Time: time,
            });

            firebase
              .firestore()
              .collection("Users")
              .doc(doc)
              .update({
                RecipesCreated: recipes + 1,
              });

            return;
          });
      }
    );

    this.setState({
      dish: "",
      description: "",
      ingredients: "",
      image: "#",
      steps: "",
    });

    this.setState({ isModalVisible: false });
    ToastAndroid.show(
      "Your Recipe Has Been Submitted Successfully",
      ToastAndroid.SHORT
    );

    alert(
      "Dear " +
        username +
        ", your recipe " +
        dish +
        "'s Details will take few minutes to be uploaded to the server. We request You To Be Patient."
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Add Recipe" navigation={this.props.navigation} />

        <ScrollView>
          <View>
            <Card>
              <Card.Title>
                Hello {this.state.username} {this.state.surname}!!
              </Card.Title>
              <Text style={{ textAlign: "center" }}>
                Can You Please Enter These Details To Add A Recipe?
              </Text>
            </Card>

            <View>{this.load()}</View>
            <Card borderRadius={10}>
              <Image
                style={{
                  width: "100%",
                  height: 200,
                  backgroundColor: "#99FF99",
                  borderRadius: 20,
                  marginBottom: RFValue(20),
                }}
                source={{ uri: this.state.image }}
              />
              <TouchableOpacity
                style={{
                  width: 200,
                  backgroundColor: "#FF8000",
                  height: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowOpacity: 0.44,
                  shadowRadius: 50.32,
                  elevation: 16,
                  color: "white",
                  borderRadius: 10,
                  marginBottom: 20,
                  alignSelf: "center",
                }}
                onPress={this.selectPicture}
              >
                <View style={{ flexDirection: "row" }}>
                  <Icon
                    name="plus-circle"
                    size={35}
                    color="white"
                    type="font-awesome"
                  />
                  <Text
                    style={{ color: "white", fontWeight: "500", fontSize: 20 }}
                  >
                    {" "}
                    Add Image
                  </Text>
                </View>
              </TouchableOpacity>
              <Input
                label="Your Recipe Name"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                style={{
                  marginTop: RFValue(22),
                }}
                placeholderTextColor="gray"
                onChangeText={(text) => {
                  this.setState({
                    dish: text,
                  });
                }}
                value={this.state.dish}
              />
              <DropDownPicker
                dropDownMaxHeight={170}
                labelStyle={{ fontSize: 14, color: "blue", fontWeight: "500" }}
                defaultNull
                placeholder="Select The Meal Time"
                items={[
                  { label: "Breakfast", value: "Breakfast" },
                  { label: "Lunch", value: "Lunch" },
                  { label: "Snack", value: "Snack" },
                  { label: "Dinner", value: "Dinner" },
                ]}
                defaultValue={this.state.time}
                containerStyle={{ height: 40, marginBottom: 20 }}
                style={{ backgroundColor: "#fafafa" }}
                itemStyle={{
                  justifyContent: "flex-start",
                }}
                dropDownStyle={{ backgroundColor: "#fafafa" }}
                onChangeItem={(item) =>
                  this.setState({
                    time: item.value,
                  })
                }
              />
              <Input
                label="A 3 word Description About It"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                style={{
                  marginTop: RFValue(22),
                }}
                maxLength={15}
                numberOfLines={2}
                underlineColorAndroid="transparent"
                placeholderTextColor="gray"
                onChangeText={(text) => {
                  this.setState({
                    description: text,
                  });
                }}
                value={this.state.description}
              />
              <Input
                label="Ingredients"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                style={{
                  marginTop: RFValue(22),
                }}
                multiline={true}
                underlineColorAndroid="transparent"
                placeholder=" "
                placeholderTextColor="gray"
                onChangeText={(text) => {
                  this.setState({
                    ingredients: text,
                  });
                }}
                value={this.state.ingredients}
              />
              <Input
                label="Steps To Make It"
                labelStyle={{ fontWeight: "bold", color: "black" }}
                style={{
                  marginTop: RFValue(22),
                }}
                multiline={true}
                underlineColorAndroid="transparent"
                placeholder=" "
                placeholderTextColor="gray"
                onChangeText={(text) => {
                  this.setState({
                    steps: text,
                  });
                }}
                value={this.state.steps}
              />
            </Card>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.request(
                  this.state.dish,
                  this.state.description,
                  this.state.ingredients,
                  this.state.steps
                );
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Add Recipe
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

  logost: {
    fontWeight: "bold",
    fontSize: 30,
    color: "yellow",
    textAlign: "center",
    marginBottom: RFValue(34),
  },
  formInput: {
    borderWidth: 3,
    borderColor: "gray",
    backgroundColor: "white",
    borderRadius: 10,
    height: RFValue(13),
    width: RFValue(1.4),
    textAlign: "center",
    marginTop: RFValue(22),
    alignSelf: "center",
  },
  button: {
    width: 200,
    backgroundColor: "#FF8000",
    height: 40,
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
});
