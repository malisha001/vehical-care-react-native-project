import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { modItemApi } from "../../api/endpoints";
import { InfoRow, StatusPill } from "../../components/ui/MobileUI";

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-violet-700">
          {item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              className="w-full h-64 bg-gray-100"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 items-center justify-center">
              <View className="h-20 w-20 rounded-3xl bg-white/15 items-center justify-center">
                <Ionicons name="build-outline" size={42} color="#fff" />
              </View>
            </View>
          )}
        </View>

        <View className="mx-4 -mt-8 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-bold text-gray-950">
                {item.name}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {item.brand} - {item.category}
              </Text>
            </View>
            <StatusPill
              label={item.isAvailable ? "In stock" : "Out of stock"}
              tone={item.isAvailable ? "green" : "red"}
            />
          </View>

          <View className="flex-row gap-3 my-4">
            <View className="flex-1">
              <InfoRow
                icon="cube-outline"
                label="Stock"
                value={`${item.stockQty} units`}
              />
            </View>
            <View className="flex-1">
              <InfoRow icon="pricetag-outline" label="Type" value={item.category} />
            </View>
          </View>

          <Text className="text-gray-700 text-base leading-6">
            {item.description}
          </Text>

          {item.tags.length > 0 ? (
            <View className="mt-5">
              <Text className="text-gray-900 font-bold mb-2">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <View
                    key={tag}
                    className="bg-violet-50 border border-violet-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-violet-700 text-sm">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View className="mt-6 bg-gray-50 rounded-3xl p-4 border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={18} color="#4b5563" />
              <Text className="text-gray-800 font-bold ml-2">
                Availability info
              </Text>
            </View>
            <Text className="text-gray-500 text-sm leading-5">
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
