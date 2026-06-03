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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { authApi } from "../../api/endpoints";
import { useAuthStore } from "../../store/authStore";

type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Platform.OS === "android" ? 40 : 0,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-8 pb-8">
            <View className="flex-1 justify-between">
              <View>
                <View className="h-16 w-16 rounded-3xl bg-primary-600 items-center justify-center mb-6">
                  <Ionicons name="car-sport-outline" size={34} color="#fff" />
                </View>
                <Text className="text-white text-4xl font-bold leading-tight">
                  Welcome back
                </Text>
                <Text className="text-primary-100 text-base mt-3 leading-6">
                  Sign in to book services, track repairs, and manage carrier
                  requests.
                </Text>
              </View>

              <View className="bg-white rounded-3xl p-5 shadow-xl border border-white/20 mt-8">
                <View className="mb-5">
                  <Text className="text-gray-950 text-2xl font-bold">
                    Sign in
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Use your registered account details.
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </Text>
                  <View className="flex-row items-center border border-gray-100 rounded-2xl px-4 bg-gray-50">
                    <Ionicons name="mail-outline" size={19} color="#9ca3af" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your@email.com"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="flex-1 py-3.5 ml-3 text-sm text-gray-900"
                    />
                  </View>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </Text>
                  <View className="flex-row items-center border border-gray-100 rounded-2xl px-4 bg-gray-50">
                    <Ionicons
                      name="lock-closed-outline"
                      size={19}
                      color="#9ca3af"
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      className="flex-1 py-3.5 ml-3 text-sm text-gray-900"
                    />
                    <TouchableOpacity
                      onPress={() => setPasswordVisible((value) => !value)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  className="self-end mb-5 py-1"
                  activeOpacity={0.8}
                >
                  <Text className="text-primary-600 text-sm font-semibold">
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  className={`rounded-2xl py-4 items-center mb-4 ${
                    loading ? "bg-primary-500" : "bg-primary-600"
                  }`}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Sign in
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                  className="items-center py-2"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-500 text-sm">
                    Don't have an account?{" "}
                    <Text className="text-primary-600 font-bold">Register</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
