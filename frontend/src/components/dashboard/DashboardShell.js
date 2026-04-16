import { useState } from "react";
import styles from "@/styles/Home.module.css";

import AppLayout from "@/components/AppLayout/AppLayout";
import VegetableSelector from "@/components/VegetableSelector/VegetableSelector";
import GrowthChart from "@/components/GrowthChart/GrowthChart";
import WaterLevelChart from "@/components/WaterLevelChart/WaterLevelChart";
import Indicators from "@/components/Indicators/Indicators";
import Alerts from "@/components/Alerts/Alerts";
import CameraPreview from "@/components/CameraPreview/CameraPreview";
import SensorDetails from "@/components/SensorDetails/SensorDetails";
import RecentReports from "@/components/RecentReports/RecentReports";

export default function DashboardShell({
  showAlerts = true,
  showSensorDetailsBottom = true,
  title,
}) {
  const [selectedVegetable, setSelectedVegetable] = useState(null);

  return (
    <AppLayout title={title}>
      <div className={styles.selectorContainer} style={{ padding: 0 }}>
        <VegetableSelector
          onVegetableSelect={setSelectedVegetable}
          selectedVegetable={selectedVegetable}
        />
      </div>

      <div className={styles.top} style={{ paddingInline: 0, paddingBottom: 0 }}>
        <div className={styles.chartArea}>
          <GrowthChart selectedVegetable={selectedVegetable} />
          <WaterLevelChart selectedVegetable={selectedVegetable} />
        </div>

        <div className={styles.rightColumn}>
          <Indicators selectedVegetable={selectedVegetable} />
          {showAlerts ? (
            <Alerts selectedVegetable={selectedVegetable} />
          ) : (
            <SensorDetails selectedVegetable={selectedVegetable} />
          )}
        </div>
      </div>

      <div className={styles.bottom} style={{ paddingInline: 0 }}>
        <div className={styles.tile}>
          <CameraPreview selectedVegetable={selectedVegetable} />
        </div>

        {showSensorDetailsBottom && (
          <div className={styles.tile}>
            <SensorDetails selectedVegetable={selectedVegetable} />
          </div>
        )}

        <div className={styles.tile}>
          <RecentReports selectedVegetable={selectedVegetable} />
        </div>
      </div>
    </AppLayout>
  );
}

