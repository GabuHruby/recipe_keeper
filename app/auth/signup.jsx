import { useState } from "react";
import Logo from "../../assets/images/ia_logo.png";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API_BASE_URL from "../../config/api";

const SignupScreen = ({ auth, setAuth }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create account.");
      }
      setError("");
      setAuth("loggedIn");
    } catch (err) {
      setError(err.message || "Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Welcome to Recipe Keeper!</Text>
      <Text style={styles.subtitle}>Your personal cooking assistant.</Text>

      <TextInput
        style={styles.usernameInput}
        placeholder="Username"
        placeholderTextColor="#414141ff"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.emailInput}
        placeholder="Email"
        placeholderTextColor="#414141ff"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.passwordInput}
        placeholder="Password"
        placeholderTextColor="#414141ff"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity onPress={handleSignup}>
        <Text style={styles.log_in}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setAuth("login")}>
          <Text style={styles.signUpButton}>Log In</Text>
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
    fontSize: 27,
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
  usernameInput: {
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
  emailInput: {
    width: "90%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
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
  errorText: {
    color: "#b3261e",
    marginBottom: 5,
    fontWeight: "600",
  },
});

export default SignupScreen;
