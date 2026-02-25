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

type Nav = NativeStackNavigationProp<RootStackParamList, "Register">;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form);
      Alert.alert("Success", "Registration successful! Please login.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed";
      Alert.alert("Error", msg);
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
            <Text className="text-5xl mb-3">🚗</Text>
            <Text className="text-2xl font-bold text-white">
              Create Account
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-xl">
            {(["name", "email", "password"] as const).map((field) => (
              <View key={field} className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field}
                </Text>
                <TextInput
                  value={form[field]}
                  onChangeText={(val) =>
                    setForm((p) => ({ ...p, [field]: val }))
                  }
                  placeholder={
                    field === "email"
                      ? "your@email.com"
                      : field === "password"
                        ? "••••••••"
                        : "Your name"
                  }
                  keyboardType={field === "email" ? "email-address" : "default"}
                  autoCapitalize={field === "name" ? "words" : "none"}
                  secureTextEntry={field === "password"}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-primary-600 rounded-xl py-4 items-center mb-4 mt-2"
            >
              <Text className="text-white font-semibold text-base">
                {loading ? "Creating account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              className="items-center"
            >
              <Text className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Text className="text-primary-600 font-semibold">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
