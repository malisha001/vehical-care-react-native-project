import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/endpoints";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, clearAuth } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
    },
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    color = "text-gray-700",
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      className="bg-white flex-row items-center px-4 py-4 border-b border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-xl w-8">{icon}</Text>
      <Text className={`flex-1 font-medium ml-2 ${color}`}>{label}</Text>
      <Text className="text-gray-400 text-lg">›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-600 pt-6 pb-10 px-6">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-primary-400 items-center justify-center mb-3">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-white font-bold text-xl">
              {user?.name || "User"}
            </Text>
            <Text className="text-primary-200 text-sm mt-1">
              {user?.email || ""}
            </Text>
            {user?.role && (
              <View className="mt-2 bg-primary-500 px-3 py-1 rounded-full">
                <Text className="text-primary-100 text-xs font-medium">
                  {user.role}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Card pulls up over header */}
        <View className="-mt-5 mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
              Account Info
            </Text>
          </View>
          <View className="px-4 py-3 flex-row justify-between">
            <Text className="text-gray-500 text-sm">Name</Text>
            <Text className="text-gray-900 font-medium text-sm">
              {user?.name}
            </Text>
          </View>
          <View className="px-4 py-3 flex-row justify-between border-t border-gray-50">
            <Text className="text-gray-500 text-sm">Email</Text>
            <Text className="text-gray-900 font-medium text-sm">
              {user?.email}
            </Text>
          </View>
          <View className="px-4 py-3 flex-row justify-between border-t border-gray-50">
            <Text className="text-gray-500 text-sm">Role</Text>
            <Text className="text-gray-900 font-medium text-sm capitalize">
              {user?.role?.toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Quick Links */}
        <View className="mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100 mb-4">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
              My Activity
            </Text>
          </View>
          <MenuItem
            icon="📋"
            label="My Repair Bookings"
            onPress={() => navigation.navigate("MyBookings")}
          />
          <MenuItem
            icon="🚚"
            label="My Carrier Requests"
            onPress={() => navigation.navigate("MyCarrierRequests")}
          />
        </View>

        {/* Services */}
        <View className="mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100 mb-4">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
              Services
            </Text>
          </View>
          <MenuItem
            icon="🧹"
            label="Cleaning Services"
            onPress={() => navigation.navigate("Cleaning")}
          />
          <MenuItem
            icon="🔩"
            label="Modification Items"
            onPress={() => navigation.navigate("Modification")}
          />
          <MenuItem
            icon="🔧"
            label="Repair Booking"
            onPress={() => navigation.navigate("Repair")}
          />
          <MenuItem
            icon="🚗"
            label="Carrier Service"
            onPress={() => navigation.navigate("Carrier")}
          />
        </View>

        {/* Logout */}
        <View className="mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100 mb-8">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
            activeOpacity={0.7}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator
                size="small"
                color="#ef4444"
                className="mr-3"
              />
            ) : (
              <Text className="text-xl w-8">🚪</Text>
            )}
            <Text className="flex-1 font-semibold ml-2 text-red-500">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
