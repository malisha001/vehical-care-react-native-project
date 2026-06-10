import React from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { cleaningApi } from "../../api/endpoints";
import { CleaningService } from "../../types";
import { EmptyState, LoadingState, ScreenHero } from "../../components/ui/MobileUI";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CleaningListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {
    data: services,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["cleaning-services"],
    queryFn: () => cleaningApi.getAll().then((r) => r.data.data),
  });

  const renderItem = ({ item }: { item: CleaningService }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CleaningDetail", { id: item._id })}
      className="bg-white mx-4 mb-3 rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      activeOpacity={0.82}
    >
      <View className="p-4">
        <View className="flex-row items-start">
          <View className="h-12 w-12 rounded-2xl bg-blue-50 items-center justify-center mr-3 border border-blue-100">
            <Ionicons name="water-outline" size={24} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-950 font-bold text-lg" numberOfLines={1}>
              {item.name}
            </Text>
            <Text
              className="text-gray-500 text-sm mt-1 leading-5"
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
          {item.price !== undefined ? (
            <View className="bg-primary-50 rounded-full px-3 py-1 mr-2">
              <Text className="text-primary-700 font-bold text-sm">
                LKR {item.price}
              </Text>
            </View>
          ) : null}
          {item.duration ? (
            <View className="flex-row items-center bg-gray-50 rounded-full px-3 py-1">
              <Ionicons name="time-outline" size={13} color="#6b7280" />
              <Text className="text-gray-600 text-xs font-semibold ml-1">
                {item.duration}
              </Text>
            </View>
          ) : null}
          <View className="ml-auto flex-row items-center">
            <Text className="text-primary-600 text-sm font-bold mr-1">
              Details
            </Text>
            <Ionicons name="arrow-forward" size={15} color="#2563eb" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHero
        eyebrow="Cleaning"
        title="Vehicle Cleaning"
        subtitle="Choose a care package for a cleaner, fresher vehicle."
        icon="water-outline"
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="water-outline"
              title="No cleaning services"
              message="Cleaning services are not available right now. Please check again later."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default CleaningListScreen;
