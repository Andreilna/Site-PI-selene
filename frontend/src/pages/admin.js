import AppLayout from "@/components/AppLayout/AppLayout";
import VegetableForm from "@/components/VegetableForm/VegetableForm";
import VegetableEdit from "@/components/VegetableEdit/VegetableEdit";
import { useRouter } from "next/router";

export default function AdminPage() {
  const router = useRouter();

  const content = router.query.id ? <VegetableEdit /> : <VegetableForm />;

  return (
    <AppLayout title="Admin — SELENE">
      {content}
    </AppLayout>
  );
}
