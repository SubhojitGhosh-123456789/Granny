import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Card, Icon, ListItem, Header } from "react-native-elements";
import db from "../config.js";
import firebase from "firebase";
import MyHeader from "../components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";

export default class MyRecipesScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();
    this.state = {
      userName: firebase.auth().currentUser.displayName,
      userId: firebase.auth().currentUser.email,
      allRecipes: [],
    };
  }

  getAllRecipes = async () => {
    await firebase
      .firestore()
      .collection("Recipes")
      .where("Email", "==", this.state.userId)
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

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => (
    <ListItem
      key={i}
      bottomDivider
      onPress={() => {
        this.props.navigation.navigate("ViewScreen", {
          Details: item,
        });
      }}
      underlayColor="transparent"
      containerStyle={{ borderRadius: 15, margin: 10, elevation: 20 }}
    >
      <ListItem.Content>
        <ListItem.Title style={{ fontWeight: "bold" }}>
          {item.Dish}
        </ListItem.Title>
        <ListItem.Subtitle>{item.Description}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="My Recipes" navigation={this.props.navigation} />
        <ScrollView>
          <View style={{ flex: 1 }}>
            {this.state.allRecipes.length === 0 ? (
              <View style={styles.subtitle}>
                <Text
                  style={{ fontSize: 20, color: "white", alignSelf: "center" }}
                >
                  No Recipes
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
});
