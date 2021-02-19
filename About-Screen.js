import React, { Component } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import db from "../config";
import firebase from "firebase";
import MyHeader from "../components/AppHeader";
import { Icon, Input, Card, Avatar } from "react-native-elements";
import { RFValue } from "react-native-responsive-fontsize";
import { ScrollView } from "react-native-gesture-handler";

export default class AboutScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="About Granny" navigation={this.props.navigation} />

        <ScrollView>
          <View
            style={{
              flex: 1,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <Card
              containerStyle={{
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../assets/icon.png")}
                style={{ width: 200, height: 200, alignSelf: "center" }}
              />
              <Card.Title>Granny</Card.Title>
              <Card.Divider />
              <Text>
                When we hear the word 'Granny' we get excited because we know
                that she knows almost everything. From spices to recipes. Thus
                Granny is a social community-based app where people can share,
                comment, rate and view recipes. People can also become famous by
                sharing recipes and being rated for the same. And for all of
                this Granny is the perfect platform to show your skills.
              </Text>
              <Card.Divider />
              <Card.Title>Developer Contact</Card.Title>
              <Card.Title>Name: Subhojit Ghosh</Card.Title>
              <Card.Title>Email: subhojit0669@gmail.com</Card.Title>
              <Card.Title>Mobile Number: +91 9137612170</Card.Title>
              <Card.Divider />
              <Card.Title>@Copyright 2021 Subhojit Ghosh</Card.Title>
            </Card>
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
});
