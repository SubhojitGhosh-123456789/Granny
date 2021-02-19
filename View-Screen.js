import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import { Header, Icon, Card, Input } from "react-native-elements";
import { RFValue } from "react-native-responsive-fontsize";
import StarRating from "react-native-star-rating";

export default class ViewScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.navigation.getParam("Details")["Email"],
      username: this.props.navigation.getParam("Details")["UserName"],
      dish: this.props.navigation.getParam("Details")["Dish"],
      ingriedients: this.props.navigation.getParam("Details")["Ingredients"],
      description: this.props.navigation.getParam("Details")["Description"],
      image: this.props.navigation.getParam("Details")["Image"],
      steps: this.props.navigation.getParam("Details")["Steps"],
      surname: this.props.navigation.getParam("Details")["Surname"],
      time: this.props.navigation.getParam("Details")["Time"],
      starCount: 5,

      pname: firebase.auth().currentUser.displayName,
      pemail: firebase.auth().currentUser.email,
      psurname: "",
      comment: "",
      ratings: [],
      recipes: [],
      average: "",
      cookr: "",
    };
  }

  getpName = () => {
    firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", this.state.pemail)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.data);
          this.setState({
            psurname: doc.data().Surname,
          });
        });
      });
  };

  componentDidMount() {
    this.getpName();
    this.getAverageRating();
    this.getCookRating();
    this.updateBadge();
  }

  addNotification = async () => {
    if (this.state.comment !== "") {
      var message =
        this.state.pname +
        " " +
        this.state.psurname +
        " has reviewed your dish " +
        this.state.dish +
        " and rated it " +
        this.state.starCount +
        "/5. Comment:- " +
        this.state.comment;

      await firebase.firestore().collection("Notifications").add({
        Dish: this.state.dish,
        CookEmail: this.state.email,
        Date: firebase.firestore.FieldValue.serverTimestamp(),
        NotificationStatus: "Unread",
        Message: message,
      });
    } else {
      var message =
        this.state.pname +
        " " +
        this.state.psurname +
        " has rated your dish " +
        this.state.dish +
        " a rating of " +
        this.state.starCount +
        "/5.";

      await firebase.firestore().collection("Notifications").add({
        Dish: this.state.dish,
        CookEmail: this.state.email,
        Date: firebase.firestore.FieldValue.serverTimestamp(),
        NotificationStatus: "Unread",
        Message: message,
      });
    }
  };

  getCookRating = async () => {
    await firebase
      .firestore()
      .collection("Recipes")
      .where("Email", "==", this.state.email)
      .where("UserName", "==", this.state.username)
      .where("Surname", "==", this.state.surname)
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
          this.updateBadge();
        });
      });
  };

  getAverageRating = async () => {
    await firebase
      .firestore()
      .collection("DishRatings")
      .where("Dish", "==", this.state.dish)
      .where("CookEmail", "==", this.state.email)
      .onSnapshot((snapshot) => {
        var ratings = snapshot.docs.map((document) => document.data());
        this.setState({ ratings: ratings });

        var rating = [];

        this.state.ratings.map((item) => {
          rating.push(item.Rating);

          var sum = 0;
          for (var i = 0; i < rating.length; i++) {
            sum += parseInt(rating[i], 10);
          }

          var avg = sum / rating.length;

          this.setState({ average: avg });
          this.updateRating();
          this.getCookRating();
          this.updateBadge();
        });
      });
  };

  updateRating = async () => {
    await firebase
      .firestore()
      .collection("Recipes")
      .where("Dish", "==", this.state.dish)
      .where("Email", "==", this.state.email)
      .where("UserName", "==", this.state.username)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          firebase.firestore().collection("Recipes").doc(doc.id).update({
            Rating: this.state.average,
          });
        });
      });
  };

  updateBadge = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", this.state.email)
      .where("Name", "==", this.state.username)
      .where("Surname", "==", this.state.surname)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().Rating === 5) {
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge:
                "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2F1.jpg?alt=media&token=c614f463-712d-40ba-a60e-baac9368a74e",
            });
          } else if (5 > doc.data().Rating >= 4.5) {
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge:
                "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2F2.jpg?alt=media&token=a3d59d3a-6792-4ec2-a48c-f608bf7e1421",
            });
          } else if (4.5 > doc.data().Rating >= 4) {
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge:
                "https://firebasestorage.googleapis.com/v0/b/granny-da367.appspot.com/o/UserProfiles%2F3.jpg?alt=media&token=c176e04e-4f8e-4677-a6aa-87441899b414",
            });
          } else {
            firebase.firestore().collection("Users").doc(doc.id).update({
              Badge: "#",
            });
          }
        });
      });
  };

  updateCookRating = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .where("Email", "==", this.state.email)
      .where("Name", "==", this.state.username)
      .where("Surname", "==", this.state.surname)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          firebase.firestore().collection("Users").doc(doc.id).update({
            Rating: this.state.cookr,
          });
        });
      });
  };

  addRating = async () => {
    await firebase.firestore().collection("DishRatings").add({
      Dish: this.state.dish,
      CookEmail: this.state.email,
      Rating: this.state.starCount,
    });

    this.getAverageRating();
  };

  render() {
    return (
      <View style={styles.container}>
        <Header
          backgroundColor="#CC6600"
          leftComponent={
            <Icon
              name="arrow-left"
              type="feather"
              color="white"
              onPress={() => this.props.navigation.goBack()}
            />
          }
          centerComponent={{
            text: "View Recipe",
            style: { color: "white", fontSize: 17, marginTop: 10 },
          }}
        />
        <ScrollView>
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
              <Card.Title>Ingredients for {this.state.dish} are: -</Card.Title>
              <Text>{this.state.ingriedients}</Text>
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
                  By {this.state.username} {this.state.surname}
                </Text>
              </View>
              <Card.Divider />
              <View>
                {this.state.average !== "" ? (
                  <Card.Title>
                    {this.state.dish} has recieved an average rating of{" "}
                    {this.state.average}/5
                  </Card.Title>
                ) : (
                  <Card.Title>
                    {this.state.dish} has not been rated yet
                  </Card.Title>
                )}
              </View>

              <Card.Title>Rate The Recipe:- </Card.Title>
              <StarRating
                disabled={false}
                maxStars={5}
                fullStarColor={"yellow"}
                containerStyle={{
                  backgroundColor: "black",
                  alignItems: "center",
                  borderRadius: 20,
                }}
                rating={this.state.starCount}
                selectedStar={(rating) => {
                  this.setState({
                    starCount: rating,
                  });
                }}
                starSize={30}
                starStyle={{ margin: 10 }}
              />
              <View style={{ marginTop: 20 }}>
                <Input
                  label="Comment On The Recipe"
                  labelStyle={{ fontWeight: "bold" }}
                  numberOfLines={3}
                  multiline={true}
                  underlineColorAndroid="transparent"
                  placeholderTextColor="gray"
                  onChangeText={(text) => {
                    this.setState({
                      comment: text,
                    });
                  }}
                  value={this.state.comment}
                />
              </View>

              <TouchableOpacity
                style={styles.logOutButton}
                onPress={() => {
                  this.addNotification();
                  this.addRating();
                  console.log(this.state.starCount);
                  alert(
                    "Thank You For Rating " +
                      this.state.username +
                      "'s recipe " +
                      this.state.dish +
                      " a rating of " +
                      this.state.starCount +
                      "/5."
                  );
                }}
              >
                <Text style={styles.logOutText}>Submit</Text>
              </TouchableOpacity>
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
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "#99FF99",
  },

  logOutContainer: {
    marginTop: RFValue(13),
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: RFValue(22),
  },
  logOutButton: {
    justifyContent: "center",
    width: 200,
    backgroundColor: "#FF8000",
    height: 40,
    borderRadius: 5,
    alignItems: "center",
    shadowOpacity: 0.44,
    shadowRadius: 50.32,
    elevation: 16,
    alignSelf: "center",
    color: "white",
    marginTop: 20,
  },
  logOutText: {
    fontSize: 20,
    color: "white",
  },
});
