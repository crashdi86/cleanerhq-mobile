import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Detail</Text>
      <Text style={styles.subtitle}>Job ID: {id}</Text>
      <Text style={styles.subtitle}>Full detail coming in M-03</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
});
