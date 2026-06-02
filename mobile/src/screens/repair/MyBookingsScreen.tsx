import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { repairBookingApi } from "../../api/endpoints";
import { RepairBooking } from "../../types";
import { EmptyState, LoadingState, ScreenHero, StatusPill } from "../../components/ui/MobileUI";

const STATUS_STYLES: Record<
  string,
  { tone: "blue" | "green" | "red" | "yellow"; label: string }
> = {
  PENDING: { tone: "yellow", label: "Pending" },
  CONFIRMED: { tone: "blue", label: "Confirmed" },
  COMPLETED: { tone: "green", label: "Completed" },
  CANCELLED: { tone: "red", label: "Cancelled" },
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
    const status = STATUS_STYLES[item.status] || STATUS_STYLES.PENDING;
    return (
      <View className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 mx-4 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row flex-1 mr-3">
            <View className="h-12 w-12 rounded-2xl bg-orange-50 items-center justify-center mr-3 border border-orange-100">
              <Ionicons name="calendar-outline" size={22} color="#ea580c" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-950">
                {item.date}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {item.timeSlot}
              </Text>
            </View>
          </View>
          <StatusPill label={status.label} tone={status.tone} />
        </View>

        {(item.vehiclePlate || item.vehicleModel) ? (
          <View className="bg-gray-50 rounded-2xl px-3 py-2 mb-3 flex-row items-center">
            <Ionicons name="car-outline" size={16} color="#9ca3af" />
            <Text className="text-gray-700 text-sm ml-2">
              {[item.vehicleModel, item.vehiclePlate].filter(Boolean).join(" - ")}
            </Text>
          </View>
        ) : null}

        <Text
          numberOfLines={2}
          className="text-gray-600 text-sm leading-5 mb-2"
        >
          {item.issueDescription}
        </Text>

        {item.adminNotes ? (
          <View className="bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2 mt-1">
            <Text className="text-blue-600 text-xs font-bold mb-0.5">
              Admin note
            </Text>
            <Text className="text-blue-700 text-sm">{item.adminNotes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHero
        eyebrow="Activity"
        title="My Bookings"
        subtitle="Track your repair appointment history and updates."
        icon="reader-outline"
      />

      {isLoading ? (
        <LoadingState />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="reader-outline"
          title="No bookings yet"
          message="You have not made any repair bookings. Book a slot to get started."
          actionLabel="Browse available slots"
          onAction={() => navigation.navigate("Repair")}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
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
