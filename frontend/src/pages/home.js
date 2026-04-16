import DashboardShell from "@/components/dashboard/DashboardShell";

export default function Home() {
  return (
    <DashboardShell
      title="Painel SELENE"
      showAlerts={true}
      showSensorDetailsBottom={true}
    />
  );
}
