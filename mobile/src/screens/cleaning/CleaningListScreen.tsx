import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { cleaningApi } from "../../api/endpoints";
import { CleaningService } from "../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CleaningListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { data: services, isLoading } = useQuery({
    queryKey: ["cleaning-services"],
    queryFn: () => cleaningApi.getAll().then((r) => r.data.data),
  });

  const renderItem = ({ item }: { item: CleaningService }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("CleaningDetail", { id: item._id })}
      className="bg-white mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      activeOpacity={0.7}
    >
      <View className="bg-blue-500 h-2" />
      <View className="p-4">
        <Text className="text-gray-900 font-bold text-lg">{item.name}</Text>
        <Text
          className="text-gray-500 text-sm mt-1 leading-relaxed"
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View className="flex-row items-center justify-between mt-3">
          {item.price !== undefined && (
            <Text className="text-primary-600 font-bold text-lg">
              ₹{item.price}
            </Text>
          )}
          {item.duration && (
            <Text className="text-gray-400 text-sm">⏱ {item.duration}</Text>
          )}
          <Text className="text-primary-600 text-sm font-medium">View →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary-900 px-4 py-5">
        <Text className="text-white text-xl font-bold">Vehicle Cleaning</Text>
        <Text className="text-primary-200 text-sm mt-1">
          Choose a cleaning service
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-400 text-base">
                No cleaning services available
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default CleaningListScreen;
