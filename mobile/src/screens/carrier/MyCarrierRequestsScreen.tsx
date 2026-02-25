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
import { carrierRequestApi } from "../../api/endpoints";
import { CarrierRequest } from "../../types";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string; icon: string }
> = {
  REQUESTED: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Requested",
    icon: "⏳",
  },
  ASSIGNED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Assigned",
    icon: "🚚",
  },
  COMPLETED: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completed",
    icon: "✅",
  },
  CANCELLED: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Cancelled",
    icon: "❌",
  },
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
    const s = STATUS_STYLES[item.status] || STATUS_STYLES.REQUESTED;
    return (
      <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 mx-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-gray-900 font-bold text-base">
              {item.name}
            </Text>
            <Text className="text-gray-500 text-sm">📞 {item.mobile}</Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full flex-row items-center ${s.bg}`}
          >
            <Text className="mr-1 text-xs">{s.icon}</Text>
            <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
          </View>
        </View>

        <View className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
          <Text className="text-gray-400 text-xs mb-0.5">
            📍 Pickup Address
          </Text>
          <Text className="text-gray-700 text-sm">{item.address}</Text>
        </View>

        {item.assignedDriver && (
          <View className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-3">
            <Text className="text-blue-600 text-xs font-semibold mb-0.5">
              Assigned Driver
            </Text>
            <Text className="text-blue-700 text-sm">
              🧑‍✈️ {item.assignedDriver}
            </Text>
          </View>
        )}

        {item.notes ? (
          <Text className="text-gray-500 text-sm italic">"{item.notes}"</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          My Carrier Requests
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Track your carrier service requests
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🚚</Text>
          <Text className="text-gray-600 font-semibold text-lg text-center">
            No Requests Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            You haven't made any carrier service requests yet.
          </Text>
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl px-6 py-3 mt-6"
            onPress={() => navigation.navigate("Carrier")}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold">
              Request Carrier Service
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#f97316"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyCarrierRequestsScreen;
