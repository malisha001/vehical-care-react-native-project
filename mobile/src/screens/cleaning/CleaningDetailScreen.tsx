import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { cleaningApi, cleaningSlotApi } from "../../api/endpoints";
import { CleaningSlot } from "../../types";
import { EmptyState, InfoRow, StatusPill } from "../../components/ui/MobileUI";

type Route = RouteProp<RootStackParamList, "CleaningDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const groupByDate = (
  slots: CleaningSlot[],
): { date: string; slots: CleaningSlot[] }[] => {
  const map = new Map<string, CleaningSlot[]>();
  slots.forEach((slot) => {
    const list = map.get(slot.date) || [];
    list.push(slot);
    map.set(slot.date, list);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({
      date,
      slots: slots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
    }));
};

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const CleaningDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { id } = route.params;

  const {
    data: service,
    isLoading,
    refetch: refetchService,
    isRefetching: serviceRefetching,
  } = useQuery({
    queryKey: ["cleaning-service", id],
    queryFn: () => cleaningApi.getById(id).then((r) => r.data.data),
  });

  const {
    data: slots = [],
    isLoading: slotsLoading,
    refetch: refetchSlots,
    isRefetching: slotsRefetching,
  } = useQuery<CleaningSlot[]>({
    queryKey: ["cleaning-slots-available", id],
    queryFn: () => cleaningSlotApi.getAvailable(id).then((r) => r.data.data),
  });

  const refreshing = serviceRefetching || slotsRefetching;
  const refreshScreen = () => {
    refetchService();
    refetchSlots();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Service not found</Text>
      </View>
    );
  }

  const grouped = groupByDate(slots.filter((slot) => slot.isAvailable));

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshScreen}
            tintColor="#2563eb"
          />
        }
      >
        <View className="bg-primary-900 px-6 pt-8 pb-16">
          <View className="h-16 w-16 rounded-3xl bg-primary-600 items-center justify-center mb-5">
            <Ionicons name="water-outline" size={34} color="#fff" />
          </View>
          <StatusPill label="Booking available" tone="green" icon="checkmark" />
          <Text className="text-white text-3xl font-bold mt-4">
            {service.name}
          </Text>
          <Text className="text-white/75 text-sm mt-2 leading-5">
            {service.description}
          </Text>
          <TouchableOpacity
            className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3 flex-row items-center justify-between mt-5"
            onPress={() => navigation.navigate("MyCleaningBookings")}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={19} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Cleaning reservations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="mx-4 -mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-5">
          <View className="flex-row gap-3">
            {service.price !== undefined ? (
              <View className="flex-1">
                <InfoRow
                  icon="cash-outline"
                  label="Price"
                  value={`LKR ${service.price}`}
                />
              </View>
            ) : null}
            {service.duration ? (
              <View className="flex-1">
                <InfoRow
                  icon="time-outline"
                  label="Duration"
                  value={service.duration}
                />
              </View>
            ) : null}
          </View>
        </View>

        <View className="px-4 pb-6">
          <Text className="text-gray-950 font-bold text-lg mb-3">
            Available slots
          </Text>

          {slotsLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : grouped.length === 0 ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="No available slots"
              message="There are no cleaning appointments open for this service right now."
            />
          ) : (
            grouped.map((group) => (
              <View key={group.date} className="mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mr-3">
                    <Ionicons name="calendar-outline" size={19} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-gray-950 font-bold">
                      {formatDate(group.date)}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {group.slots.length} slots available
                    </Text>
                  </View>
                </View>

                {group.slots.map((slot) => (
                  <View
                    key={slot._id}
                    className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center flex-1 mr-3">
                        <View className="h-11 w-11 rounded-2xl bg-gray-50 items-center justify-center mr-3">
                          <Ionicons name="time-outline" size={22} color="#4b5563" />
                        </View>
                        <View>
                          <Text className="text-gray-950 font-bold text-base">
                            {slot.timeSlot}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-0.5">
                            {slot.currentBookings} of {slot.maxBookings} booked
                          </Text>
                        </View>
                      </View>
                      <StatusPill label="Available" tone="green" />
                    </View>

                    <TouchableOpacity
                      className="bg-primary-600 rounded-2xl py-3 items-center"
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate("CleaningBookingForm", {
                          serviceId: service._id,
                          serviceName: service.name,
                          slotId: slot._id,
                          date: slot.date,
                          timeSlot: slot.timeSlot,
                        })
                      }
                    >
                      <Text className="text-white font-bold text-sm">
                        Book this slot
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CleaningDetailScreen;
