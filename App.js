import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import HomeScreen from "./HomeScreen";
import Calendario from "./Calendario";
import AdministracionScreen from "./AdministracionScreen";
import HorariosScreen from "./HorariosScreen";
import BackupScreen from "./BackupScreen";
import { ActivitiesProvider } from "./ActivitiesContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DataProvider } from "./DataContext";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DataProvider>
      <SafeAreaProvider>
        <ActivitiesProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
                  if (route.name === "Inicio") {
                    iconName = focused ? "home" : "home-outline";
                  } else if (route.name === "Calendario") {
                    iconName = focused ? "calendar" : "calendar-outline";
                  } else if (route.name === "Administración") {
                    iconName = focused ? "settings" : "settings-outline";
                  } else if (route.name === "Horarios") {
                    iconName = focused ? "time" : "time-outline";
                  } else if (route.name === "Respaldo") {
                    iconName = focused ? "save" : "save-outline";
                  }
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#007BFF",
                tabBarInactiveTintColor: "gray",
              })}
            >
              <Tab.Screen name="Inicio" component={HomeScreen} />
              <Tab.Screen name="Calendario" component={Calendario} />
              <Tab.Screen name="Administración" component={AdministracionScreen} />
              <Tab.Screen name="Horarios" component={HorariosScreen} />
              <Tab.Screen name="Respaldo" component={BackupScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </ActivitiesProvider>
      </SafeAreaProvider>
    </DataProvider>
  );
}