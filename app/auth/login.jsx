import Logo from "../../assets/images/ia_logo.png";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LogInScreen = ({ auth, setAuth }) => {
  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Recipe Keeper</Text>
      <Text style={styles.subtitle}>Your personal cooking assistant.</Text>

      <TextInput
        style={styles.emailInput}
        placeholder="Email"
        placeholderTextColor="#414141ff"
      />
      <TextInput
        style={styles.passwordInput}
        placeholder="Password"
        placeholderTextColor="#414141ff"
        secureTextEntry={true}
      />

      <TouchableOpacity onPress={() => setAuth("loggedIn")}>
        <Text style={styles.log_in}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setAuth("signup")}>
          <Text style={styles.signUpButton}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#efefefff",
  },
  logo: {
    width: 220,
    height: 160,
    marginTop: 100,
    marginBottom: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  emailInput: {
    width: "90%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 100,
    marginBottom: 20,
    backgroundColor: "#cececeff",
  },
  passwordInput: {
    width: "90%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#cececeff",
  },
  log_in: {
    width: 330,
    height: 50,
    backgroundColor: "#4CAF50",
    color: "#fff",
    textAlign: "center",
    lineHeight: 50,
    borderRadius: 15,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signUpText: {
    fontSize: 13,
    color: "#333",
  },
  signUpButton: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

export default LogInScreen;
