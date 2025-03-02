import React, { useContext, useMemo, memo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { ActivitiesContext } from "./ActivitiesContext";
import { stylesCalendar } from "./stylesCalendar";

const CALENDAR_THEME = {
  calendarBackground: "#fff",
  todayTextColor: "#007BFF",
  dayTextColor: "#2d4150",
  textDisabledColor: "#d9e1e8",
  monthTextColor: "#007BFF",
  arrowColor: "#007BFF",
  dotColor: "#007BFF",
  selectedDayBackgroundColor: "#E8E8E8",
  selectedDayTextColor: "#2d4150",
};

const ActivityItem = memo(({ activity, onEdit, onDelete }) => (
  <View style={stylesCalendar.activityItem}>
    <View style={stylesCalendar.activityTextContainer}>
      <Text style={stylesCalendar.activityName}>{activity.activityName}</Text>
      <Text style={stylesCalendar.activityTime}>
        {new Date(activity.activityTime).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
    <View style={stylesCalendar.activityButtons}>
      <TouchableOpacity
        onPress={() => onDelete(activity.id)}
        style={stylesCalendar.deleteButton}
        activeOpacity={0.7}
      >
        <Text style={stylesCalendar.buttonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const ActivitiesList = memo(({ activities, date, onEdit, onDelete }) => {
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX");
  }, []);

  return (
    <View style={stylesCalendar.activitiesContainer}>
      <Text style={stylesCalendar.activitiesTitle}>
        Actividades para {formatDate(date)}:
      </Text>
      <ScrollView style={stylesCalendar.activitiesList}>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <Text style={stylesCalendar.noActivitiesText}>
            No hay actividades para este día
          </Text>
        )}
      </ScrollView>
    </View>
  );
});

const Calendario = () => {
  const {
    activities,
    setActivities,
    selectedDate,
    setSelectedDate,
    activitiesForDay,
  } = useContext(ActivitiesContext);

  // Implement edit function that will be used by the Edit button
  const handleEditActivity = useCallback(
    (activity) => {
      // Find the index of the activity in the main activities array
      const activityIndex = activities.findIndex(
        (item) => item.id === activity.id
      );

      // If we found the activity in our array
      if (activityIndex !== -1) {
        // You need to dispatch this to your navigation or modal system
        // This should open the ActivityForm with the proper edit index
        // For example, if you're using React Navigation:
        // navigation.navigate('ActivityForm', { editIndex: activityIndex });

        // Or if you're using a modal approach like in your HomeScreen:
        // Set the editIndex and open the modal
        if (global.setEditIndex && global.setModalVisible) {
          global.setEditIndex(activityIndex);
          global.setModalVisible(true);
        } else {
          // Fallback if the global handlers aren't available
          Alert.alert(
            "Editar Actividad",
            "Por favor, vaya a la pantalla principal para editar esta actividad."
          );
        }
      }
    },
    [activities]
  );

  // Implement delete function that will be used by the Delete button
  const handleDeleteActivity = useCallback(
    (activityId) => {
      Alert.alert(
        "Eliminar Actividad",
        "¿Estás seguro de que deseas eliminar esta actividad?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: () => {
              // Filter out the activity with the given ID
              const updatedActivities = activities.filter(
                (activity) => activity.id !== activityId
              );
              setActivities(updatedActivities);
            },
          },
        ]
      );
    },
    [activities, setActivities]
  );

  const markedDates = useMemo(() => {
    const dates = {};
    activities.forEach((activity) => {
      const date = new Date(activity.activityDate);
      date.setHours(12);
      const dateString = date.toISOString().split("T")[0];
      dates[dateString] = {
        marked: true,
        dotColor: "#007BFF",
        selected: dateString === selectedDate,
        selectedColor: "#E8E8E8",
      };
    });
    return dates;
  }, [activities, selectedDate]);

  const handleDayPress = useCallback(
    (day) => {
      setSelectedDate(day.dateString);
    },
    [setSelectedDate]
  );

  return (
    <View style={stylesCalendar.container}>
      <Calendar
        markedDates={markedDates}
        markingType="dot"
        onDayPress={handleDayPress}
        theme={CALENDAR_THEME}
      />
      {selectedDate && (
        <ActivitiesList
          activities={activitiesForDay}
          date={selectedDate}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
      )}
    </View>
  );
};

// Export a wrapper component that sets up global handlers for edit functionality
const CalendarioWrapper = () => {
  const { activities } = useContext(ActivitiesContext);

  // Make sure the Calendario component can access the global variables
  // even when rendered in different navigation contexts
  React.useEffect(() => {
    // You might need to initialize these globals from your main component
    // This is a workaround for cross-component communication
    if (!global.activitiesForCalendar) {
      global.activitiesForCalendar = activities;
    }
  }, [activities]);

  return <Calendario />;
};

export default memo(CalendarioWrapper);
