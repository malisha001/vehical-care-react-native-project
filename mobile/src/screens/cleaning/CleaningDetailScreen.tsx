import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { cleaningApi } from "../../api/endpoints";

type Route = RouteProp<RootStackParamList, "CleaningDetail">;

const CleaningDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { id } = route.params;

  const { data: service, isLoading } = useQuery({
    queryKey: ["cleaning-service", id],
    queryFn: () => cleaningApi.getById(id).then((r) => r.data.data),
  });

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-blue-500 h-32 items-center justify-center">
          <Text className="text-white text-5xl">🧹</Text>
        </View>
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900">
            {service.name}
          </Text>
          <View className="flex-row gap-4 mt-3 mb-4">
            {service.price !== undefined && (
              <View className="bg-primary-50 px-4 py-2 rounded-full">
                <Text className="text-primary-700 font-bold">
                  ₹{service.price}
                </Text>
              </View>
            )}
            {service.duration && (
              <View className="bg-gray-100 px-4 py-2 rounded-full">
                <Text className="text-gray-600">⏱ {service.duration}</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-700 text-base leading-relaxed">
            {service.description}
          </Text>

          <View className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
            <Text className="text-green-800 font-semibold">
              ✅ Service Available
            </Text>
            <Text className="text-green-600 text-sm mt-1">
              Visit us at the service center to avail this service. No advance
              booking required for cleaning.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CleaningDetailScreen;
