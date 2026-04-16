import DashboardShell from "@/components/dashboard/DashboardShell";

export default function MonitoramentoPage() {
  return (
    <DashboardShell
      title="Monitoramento — SELENE"
      showAlerts={false}
      showSensorDetailsBottom={true}
    />
  );
}
