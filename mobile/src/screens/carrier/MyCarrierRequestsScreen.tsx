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
import { carrierRequestApi } from "../../api/endpoints";
import { CarrierRequest } from "../../types";
import { EmptyState, LoadingState, ScreenHero, StatusPill } from "../../components/ui/MobileUI";

const STATUS_STYLES: Record<
  string,
  { tone: "blue" | "green" | "red" | "yellow"; label: string }
> = {
  REQUESTED: { tone: "yellow", label: "Requested" },
  ASSIGNED: { tone: "blue", label: "Assigned" },
  COMPLETED: { tone: "green", label: "Completed" },
  CANCELLED: { tone: "red", label: "Cancelled" },
};

const MyCarrierRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<CarrierRequest[]>({
    queryKey: ["my-carrier-requests"],
    queryFn: () => carrierRequestApi.getMyRequests().then((r) => r.data.data),
  });

  const renderItem = ({ item }: { item: CarrierRequest }) => {
    const status = STATUS_STYLES[item.status] || STATUS_STYLES.REQUESTED;
    return (
      <View className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 mx-4 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row flex-1 mr-3">
            <View className="h-12 w-12 rounded-2xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100">
              <Ionicons name="car-outline" size={22} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-950 font-bold text-base">
                {item.name}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">{item.mobile}</Text>
            </View>
          </View>
          <StatusPill label={status.label} tone={status.tone} />
        </View>

        <View className="bg-gray-50 rounded-2xl px-3 py-2 mb-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs font-bold ml-1">
              Pickup address
            </Text>
          </View>
          <Text className="text-gray-700 text-sm leading-5">
            {item.address}
          </Text>
        </View>

        {item.assignedDriver ? (
          <View className="bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2 mb-3">
            <Text className="text-blue-600 text-xs font-bold mb-0.5">
              Assigned driver
            </Text>
            <Text className="text-blue-700 text-sm">
              {item.assignedDriver}
            </Text>
          </View>
        ) : null}

        {item.notes ? (
          <Text className="text-gray-500 text-sm italic">"{item.notes}"</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHero
        eyebrow="Activity"
        title="My Carrier Requests"
        subtitle="Track pickup requests and assigned driver details."
        icon="car-outline"
        accent="green"
      />

      {isLoading ? (
        <LoadingState color="#059669" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title="No requests yet"
          message="You have not made any carrier service requests yet."
          actionLabel="Request carrier service"
          onAction={() => navigation.navigate("Carrier")}
          accent="green"
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#059669"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyCarrierRequestsScreen;
