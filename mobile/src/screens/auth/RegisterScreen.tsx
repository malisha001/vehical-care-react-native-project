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

type Nav = NativeStackNavigationProp<RootStackParamList, "Register">;

type FieldName = "name" | "email" | "password";

const fieldConfig: Record<
  FieldName,
  {
    label: string;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "words";
  }
> = {
  name: {
    label: "Full name",
    placeholder: "Your name",
    icon: "person-outline",
    keyboardType: "default",
    autoCapitalize: "words",
  },
  email: {
    label: "Email",
    placeholder: "your@email.com",
    icon: "mail-outline",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  password: {
    label: "Password",
    placeholder: "Create a password",
    icon: "lock-closed-outline",
    keyboardType: "default",
    autoCapitalize: "none",
  },
};

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    <SafeAreaView className="flex-1 bg-primary-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-8 pb-8">
            <View className="flex-1 justify-between">
              <View>
                <View className="h-16 w-16 rounded-3xl bg-primary-600 items-center justify-center mb-6">
                  <Ionicons name="person-add-outline" size={32} color="#fff" />
                </View>
                <Text className="text-white text-4xl font-bold leading-tight">
                  Create account
                </Text>
                <Text className="text-primary-100 text-base mt-3 leading-6">
                  Join Vehicle Care to book services and track your requests.
                </Text>
              </View>

              <View className="bg-white rounded-3xl p-5 shadow-xl border border-white/20 mt-8">
                <View className="mb-5">
                  <Text className="text-gray-950 text-2xl font-bold">
                    Register
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Enter your details to get started.
                  </Text>
                </View>

                {(Object.keys(fieldConfig) as FieldName[]).map((field) => {
                  const cfg = fieldConfig[field];
                  const isPassword = field === "password";

                  return (
                    <View key={field} className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        {cfg.label}
                      </Text>
                      <View className="flex-row items-center border border-gray-100 rounded-2xl px-4 bg-gray-50">
                        <Ionicons name={cfg.icon} size={19} color="#9ca3af" />
                        <TextInput
                          value={form[field]}
                          onChangeText={(value) =>
                            setForm((current) => ({
                              ...current,
                              [field]: value,
                            }))
                          }
                          placeholder={cfg.placeholder}
                          placeholderTextColor="#9ca3af"
                          keyboardType={cfg.keyboardType}
                          autoCapitalize={cfg.autoCapitalize}
                          autoCorrect={false}
                          secureTextEntry={isPassword && !passwordVisible}
                          className="flex-1 py-3.5 ml-3 text-sm text-gray-900"
                        />
                        {isPassword ? (
                          <TouchableOpacity
                            onPress={() =>
                              setPasswordVisible((value) => !value)
                            }
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <Ionicons
                              name={
                                passwordVisible
                                  ? "eye-off-outline"
                                  : "eye-outline"
                              }
                              size={20}
                              color="#6b7280"
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  );
                })}

                <View className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3 mb-5">
                  <Text className="text-primary-700 text-xs leading-5">
                    Password must be at least 6 characters.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  className={`rounded-2xl py-4 items-center mb-4 ${
                    loading ? "bg-primary-400" : "bg-primary-600"
                  }`}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Create account
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  className="items-center py-2"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-500 text-sm">
                    Already have an account?{" "}
                    <Text className="text-primary-600 font-bold">Sign in</Text>
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

export default RegisterScreen;
