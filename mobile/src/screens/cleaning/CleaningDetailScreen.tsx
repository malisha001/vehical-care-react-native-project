import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { cleaningApi } from "../../api/endpoints";
import { InfoRow, StatusPill } from "../../components/ui/MobileUI";

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-primary-900 px-6 pt-8 pb-16">
          <View className="h-16 w-16 rounded-3xl bg-primary-600 items-center justify-center mb-5">
            <Ionicons name="water-outline" size={34} color="#fff" />
          </View>
          <StatusPill label="Service available" tone="green" icon="checkmark" />
          <Text className="text-white text-3xl font-bold mt-4">
            {service.name}
          </Text>
          <Text className="text-white/75 text-sm mt-2 leading-5">
            {service.description}
          </Text>
        </View>

        <View className="mx-4 -mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
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

          <View className="mt-5 bg-emerald-50 border border-emerald-100 rounded-3xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={18} color="#047857" />
              <Text className="text-emerald-800 font-bold ml-2">
                Walk-in service
              </Text>
            </View>
            <Text className="text-emerald-700 text-sm leading-5">
              Visit the service center to use this cleaning package. Advance
              booking is not required for cleaning services.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CleaningDetailScreen;
