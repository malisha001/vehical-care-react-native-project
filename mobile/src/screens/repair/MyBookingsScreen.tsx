import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { repairBookingApi } from "../../api/endpoints";
import { RepairBooking } from "../../types";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const {
    data: bookings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<RepairBooking[]>({
    queryKey: ["my-bookings"],
    queryFn: () => repairBookingApi.getMyBookings().then((r) => r.data.data),
  });

  const renderItem = ({ item }: { item: RepairBooking }) => {
    const s = STATUS_STYLES[item.status] || STATUS_STYLES.PENDING;
    return (
      <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 mx-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-bold text-gray-900 mr-2">
                📅 {item.date}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">🕐 {item.timeSlot}</Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${s.bg}`}>
            <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
          </View>
        </View>

        {(item.vehiclePlate || item.vehicleModel) && (
          <View className="bg-gray-50 rounded-xl px-3 py-2 mb-3 flex-row items-center">
            <Text className="text-gray-400 text-sm mr-2">🚗</Text>
            <Text className="text-gray-700 text-sm">
              {[item.vehicleModel, item.vehiclePlate]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          </View>
        )}

        <Text
          numberOfLines={2}
          className="text-gray-600 text-sm leading-relaxed mb-2"
        >
          {item.issueDescription}
        </Text>

        {item.adminNotes ? (
          <View className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mt-1">
            <Text className="text-blue-600 text-xs font-semibold mb-0.5">
              Admin Note
            </Text>
            <Text className="text-blue-700 text-sm">{item.adminNotes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Your repair appointment history
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : bookings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📋</Text>
          <Text className="text-gray-600 font-semibold text-lg text-center">
            No Bookings Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            You haven't made any repair bookings. Book a slot to get started.
          </Text>
          <TouchableOpacity
            className="bg-primary-600 rounded-2xl px-6 py-3 mt-6"
            onPress={() => navigation.navigate("Repair")}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold">Browse Available Slots</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyBookingsScreen;
