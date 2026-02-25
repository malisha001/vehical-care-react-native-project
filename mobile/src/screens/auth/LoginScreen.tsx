import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { authApi } from "../../api/endpoints";
import { useAuthStore } from "../../store/authStore";

type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed";
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="items-center mb-10">
            <Text className="text-6xl mb-4">🚗</Text>
            <Text className="text-3xl font-bold text-white">
              Vehicle Service
            </Text>
            <Text className="text-primary-200 mt-1 text-base">Center</Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-xl">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Sign In
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary-600 rounded-xl py-4 items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              className="items-center"
            >
              <Text className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <Text className="text-primary-600 font-semibold">Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
