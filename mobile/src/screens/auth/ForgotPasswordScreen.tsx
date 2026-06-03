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

type Nav = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const requestReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setRequestLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      const resetData = res.data.data;
      setOtpRequested(true);
      Alert.alert(
        "OTP sent",
        resetData?.expiresInMinutes
          ? `Check your email for the OTP code. It expires in ${resetData.expiresInMinutes} minutes.`
          : "If an account exists, reset instructions have been sent.",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not request password reset";
      Alert.alert("Error", msg);
    } finally {
      setRequestLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter the OTP code and new password");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      Alert.alert("Error", "OTP code must be 6 digits");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setResetLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      Alert.alert("Success", "Your password has been reset. Please sign in.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Password reset failed";
      Alert.alert("Error", msg);
    } finally {
      setResetLoading(false);
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
                  <Ionicons name="key-outline" size={32} color="#fff" />
                </View>
                <Text className="text-white text-4xl font-bold leading-tight">
                  Reset password
                </Text>
                <Text className="text-primary-100 text-base mt-3 leading-6">
                  Request an OTP code and set a new password for your account.
                </Text>
              </View>

              <View className="bg-white rounded-3xl p-5 shadow-xl border border-white/20 mt-8">
                <View className="mb-5">
                  <Text className="text-gray-950 text-2xl font-bold">
                    Forgot password
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Start with the email used on your account.
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

                <TouchableOpacity
                  onPress={requestReset}
                  disabled={requestLoading}
                  className={`rounded-2xl py-4 items-center mb-5 ${
                    requestLoading ? "bg-primary-400" : "bg-primary-600"
                  }`}
                  activeOpacity={0.85}
                >
                  {requestLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Send OTP code
                    </Text>
                  )}
                </TouchableOpacity>

                {otpRequested ? (
                  <>
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        OTP code
                      </Text>
                      <View className="flex-row items-center border border-gray-100 rounded-2xl px-4 bg-gray-50">
                        <Ionicons name="ticket-outline" size={19} color="#9ca3af" />
                        <TextInput
                          value={otp}
                          onChangeText={setOtp}
                          placeholder="Enter 6-digit code"
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          maxLength={6}
                          autoCorrect={false}
                          className="flex-1 py-3.5 ml-3 text-sm text-gray-900"
                        />
                      </View>
                    </View>

                    <View className="mb-5">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        New password
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
                          placeholder="Create a new password"
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
                            name={
                              passwordVisible ? "eye-off-outline" : "eye-outline"
                            }
                            size={20}
                            color="#6b7280"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={resetPassword}
                      disabled={resetLoading}
                      className={`rounded-2xl py-4 items-center mb-4 ${
                        resetLoading ? "bg-primary-400" : "bg-primary-600"
                      }`}
                      activeOpacity={0.85}
                    >
                      {resetLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-base">
                          Set new password
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : null}

                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  className="items-center py-2"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-500 text-sm">
                    Remember your password?{" "}
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

export default ForgotPasswordScreen;
