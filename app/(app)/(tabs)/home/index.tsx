import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth-store";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";

export default function HomeScreen() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <>
      <StatusBar style="light" />
      {role === "STAFF" ? <StaffDashboard /> : <OwnerDashboard />}
    </>
  );
}
