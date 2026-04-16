import AppLayout from "@/components/AppLayout/AppLayout";
import VegetableList from "@/components/VegetableList/VegetableList";

export default function PlantListPage({ title }) {
  return (
    <AppLayout title={title}>
      <VegetableList />
    </AppLayout>
  );
}

