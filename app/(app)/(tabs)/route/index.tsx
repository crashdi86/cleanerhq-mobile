import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/auth-store";

export default function RouteScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === "OWNER";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isOwner ? "Jobs" : "Route"}</Text>
      <Text style={styles.subtitle}>
        {isOwner ? "Job management coming in M-03" : "Route view coming in M-10"}
      </Text>
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
