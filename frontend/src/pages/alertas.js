import { useState } from "react";
import styles from "@/styles/Home.module.css";

import AppLayout from "@/components/AppLayout/AppLayout";
import VegetableSelector from "@/components/VegetableSelector/VegetableSelector";
import Alerts from "@/components/Alerts/Alerts";
import Indicators from "@/components/Indicators/Indicators";

export default function AlertasPage() {
  const [selectedVegetable, setSelectedVegetable] = useState(null);

  return (
    <AppLayout title="Alertas — SELENE">
      <div className={styles.selectorContainer} style={{ padding: 0 }}>
        <VegetableSelector
          onVegetableSelect={setSelectedVegetable}
          selectedVegetable={selectedVegetable}
        />
      </div>

      <div className={styles.top} style={{ paddingInline: 0 }}>
        <div className={styles.chartArea}>
          <Alerts selectedVegetable={selectedVegetable} />
        </div>

        <div className={styles.rightColumn}>
          <Indicators selectedVegetable={selectedVegetable} />
        </div>
      </div>
    </AppLayout>
  );
}
