import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "../store/authStore";
import { Ionicons } from "@expo/vector-icons";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Main Screens
import HomeScreen from "../screens/HomeScreen";
import CleaningListScreen from "../screens/cleaning/CleaningListScreen";
import CleaningDetailScreen from "../screens/cleaning/CleaningDetailScreen";
import ModificationListScreen from "../screens/modification/ModificationListScreen";
import ModificationDetailScreen from "../screens/modification/ModificationDetailScreen";
import RepairSlotsScreen from "../screens/repair/RepairSlotsScreen";
import RepairBookingFormScreen from "../screens/repair/RepairBookingFormScreen";
import MyBookingsScreen from "../screens/repair/MyBookingsScreen";
import CarrierRequestFormScreen from "../screens/carrier/CarrierRequestFormScreen";
import MyCarrierRequestsScreen from "../screens/carrier/MyCarrierRequestsScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  CleaningDetail: { id: string };
  ModificationDetail: { id: string };
  RepairBookingForm: { slotId: string; date: string; timeSlot: string };
  MyBookings: undefined;
  CarrierRequestForm: undefined;
  MyCarrierRequests: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cleaning: undefined;
  Modification: undefined;
  Repair: undefined;
  Carrier: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#1e3a8a" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { height: 60, paddingBottom: 8 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? "home" : "home-outline",
            Cleaning: focused ? "water" : "water-outline",
            Modification: focused ? "build" : "build-outline",
            Repair: focused ? "construct" : "construct-outline",
            Carrier: focused ? "car" : "car-outline",
            Profile: focused ? "person" : "person-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] || "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Cleaning"
        component={CleaningListScreen}
        options={{ title: "Cleaning" }}
      />
      <Tab.Screen
        name="Modification"
        component={ModificationListScreen}
        options={{ title: "Mods" }}
      />
      <Tab.Screen
        name="Repair"
        component={RepairSlotsScreen}
        options={{ title: "Repair" }}
      />
      <Tab.Screen
        name="Carrier"
        component={CarrierRequestFormScreen}
        options={{ title: "Carrier" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated() ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="CleaningDetail"
              component={CleaningDetailScreen}
              options={{
                headerShown: true,
                title: "Service Details",
                headerStyle: { backgroundColor: "#1e3a8a" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="ModificationDetail"
              component={ModificationDetailScreen}
              options={{
                headerShown: true,
                title: "Item Details",
                headerStyle: { backgroundColor: "#1e3a8a" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="RepairBookingForm"
              component={RepairBookingFormScreen}
              options={{
                headerShown: true,
                title: "Book Repair Slot",
                headerStyle: { backgroundColor: "#1e3a8a" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="MyBookings"
              component={MyBookingsScreen}
              options={{
                headerShown: true,
                title: "My Bookings",
                headerStyle: { backgroundColor: "#1e3a8a" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="MyCarrierRequests"
              component={MyCarrierRequestsScreen}
              options={{
                headerShown: true,
                title: "My Carrier Requests",
                headerStyle: { backgroundColor: "#1e3a8a" },
                headerTintColor: "#fff",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
