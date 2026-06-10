import React from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { cleaningBookingApi } from "../../api/endpoints";
import { CleaningBooking } from "../../types";
import {
  EmptyState,
  LoadingState,
  ScreenHero,
  StatusPill,
} from "../../components/ui/MobileUI";

const STATUS_STYLES: Record<
  string,
  { tone: "blue" | "green" | "red" | "yellow"; label: string }
> = {
  PENDING: { tone: "yellow", label: "Pending" },
  CONFIRMED: { tone: "blue", label: "Confirmed" },
  COMPLETED: { tone: "green", label: "Completed" },
  CANCELLED: { tone: "red", label: "Cancelled" },
};

const serviceName = (serviceId: CleaningBooking["serviceId"]) => {
  if (typeof serviceId === "object") return serviceId.name;
  return "Cleaning service";
};

const serviceDuration = (serviceId: CleaningBooking["serviceId"]) => {
  if (typeof serviceId === "object") return serviceId.duration;
  return undefined;
};

const servicePrice = (serviceId: CleaningBooking["serviceId"]) => {
  if (typeof serviceId === "object") return serviceId.price;
  return undefined;
};

const MyCleaningBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const {
    data: bookings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<CleaningBooking[]>({
    queryKey: ["my-cleaning-bookings"],
    queryFn: () => cleaningBookingApi.getMyBookings().then((r) => r.data.data),
  });

  const renderItem = ({ item }: { item: CleaningBooking }) => {
    const status = STATUS_STYLES[item.status] || STATUS_STYLES.PENDING;
    const duration = serviceDuration(item.serviceId);
    const price = servicePrice(item.serviceId);

    return (
      <View className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 mx-4 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row flex-1 mr-3">
            <View className="h-12 w-12 rounded-2xl bg-blue-50 items-center justify-center mr-3 border border-blue-100">
              <Ionicons name="water-outline" size={22} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-950">
                {serviceName(item.serviceId)}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {item.date} at {item.timeSlot}
              </Text>
            </View>
          </View>
          <StatusPill label={status.label} tone={status.tone} />
        </View>

        <View className="bg-gray-50 rounded-2xl px-3 py-2 mb-3">
          <Text className="text-gray-700 text-sm font-semibold">
            {[item.vehicleModel, item.vehiclePlate].filter(Boolean).join(" - ") ||
              "Vehicle details not added"}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {[duration, price !== undefined ? `LKR ${price}` : undefined]
              .filter(Boolean)
              .join(" - ") || "Cleaning booking"}
          </Text>
        </View>

        {item.notes ? (
          <Text numberOfLines={3} className="text-gray-600 text-sm leading-5 mb-2">
            {item.notes}
          </Text>
        ) : null}

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
        eyebrow="Notifications"
        title="Cleaning Reservations"
        subtitle="Track your reserved cleaning slots and booking status."
        icon="notifications-outline"
      />

      {isLoading ? (
        <LoadingState />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="calendar-clear-outline"
          title="No cleaning reservations"
          message="You have not reserved any cleaning slots yet."
          actionLabel="Book cleaning"
          onAction={() => navigation.navigate("Cleaning")}
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

export default MyCleaningBookingsScreen;
