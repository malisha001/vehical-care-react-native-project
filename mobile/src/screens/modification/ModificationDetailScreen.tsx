import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { modItemApi } from "../../api/endpoints";

type Route = RouteProp<RootStackParamList, "ModificationDetail">;

const ModificationDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { id } = route.params;

  const { data: item, isLoading } = useQuery({
    queryKey: ["mod-item", id],
    queryFn: () => modItemApi.getById(id).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Item not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            className="w-full h-52 bg-gray-100"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-52 bg-gray-100 items-center justify-center">
            <Text className="text-6xl">🔧</Text>
          </View>
        )}

        <View className="p-6">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {item.brand} • {item.category}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full ${item.isAvailable ? "bg-green-100" : "bg-red-100"}`}
            >
              <Text
                className={`font-semibold text-sm ${item.isAvailable ? "text-green-700" : "text-red-700"}`}
              >
                {item.isAvailable ? "✅ In Stock" : "❌ Out of Stock"}
              </Text>
            </View>
          </View>

          <Text className="text-gray-700 text-base leading-relaxed mb-4">
            {item.description}
          </Text>

          {item.tags.length > 0 && (
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <View
                    key={tag}
                    className="bg-primary-50 border border-primary-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-primary-700 text-sm">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-gray-700 font-semibold text-sm mb-2">
              Availability Info
            </Text>
            <Text className="text-gray-500 text-sm">
              {item.isAvailable
                ? "This item is currently in stock. Visit our service center to place an order with our team."
                : "This item is currently out of stock. Please check back later or contact us for more information."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModificationDetailScreen;
