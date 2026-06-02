import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/endpoints";
import { InfoRow, ScreenHero, StatusPill } from "../components/ui/MobileUI";

type IconName = keyof typeof Ionicons.glyphMap;

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
    color = "#374151",
  }: {
    icon: IconName;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      className="bg-white flex-row items-center px-4 py-4 border-b border-gray-100"
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View className="h-10 w-10 rounded-2xl bg-gray-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="flex-1 font-semibold text-gray-800">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHero
          eyebrow="Account"
          title={user?.name || "User"}
          subtitle={user?.email || ""}
          icon="person-outline"
        >
          {user?.role ? (
            <View className="self-start">
              <StatusPill label={user.role} tone="blue" />
            </View>
          ) : null}
        </ScreenHero>

        <View className="mx-4 -mt-4 bg-white rounded-3xl shadow-sm border border-gray-100 mb-4 p-4 gap-3">
          <InfoRow icon="person-outline" label="Name" value={user?.name || "-"} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email || "-"} />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Role"
            value={user?.role?.toLowerCase() || "-"}
          />
        </View>

        <View className="mx-4 bg-white rounded-3xl overflow-hidden border border-gray-100 mb-4 shadow-sm">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide">
              My activity
            </Text>
          </View>
          <MenuItem
            icon="reader-outline"
            label="My repair bookings"
            onPress={() => navigation.navigate("MyBookings")}
            color="#2563eb"
          />
          <MenuItem
            icon="car-outline"
            label="My carrier requests"
            onPress={() => navigation.navigate("MyCarrierRequests")}
            color="#059669"
          />
        </View>

        <View className="mx-4 bg-white rounded-3xl overflow-hidden border border-gray-100 mb-4 shadow-sm">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide">
              Services
            </Text>
          </View>
          <MenuItem
            icon="water-outline"
            label="Cleaning services"
            onPress={() => navigation.navigate("Cleaning")}
            color="#2563eb"
          />
          <MenuItem
            icon="build-outline"
            label="Modification items"
            onPress={() => navigation.navigate("Modification")}
            color="#7c3aed"
          />
          <MenuItem
            icon="construct-outline"
            label="Repair booking"
            onPress={() => navigation.navigate("Repair")}
            color="#ea580c"
          />
          <MenuItem
            icon="car-outline"
            label="Carrier service"
            onPress={() => navigation.navigate("Carrier")}
            color="#059669"
          />
        </View>

        <View className="mx-4 bg-white rounded-3xl overflow-hidden border border-gray-100 mb-8 shadow-sm">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
            activeOpacity={0.78}
          >
            <View className="h-10 w-10 rounded-2xl bg-red-50 items-center justify-center mr-3">
              {logoutMutation.isPending ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              )}
            </View>
            <Text className="flex-1 font-bold text-red-500">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
