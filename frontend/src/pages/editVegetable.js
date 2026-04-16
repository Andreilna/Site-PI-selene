// Página administrativa preservada por compatibilidade de rota.
import AppLayout from '@/components/AppLayout/AppLayout';
import VegetableEdit from '@/components/VegetableEdit/VegetableEdit';

export default function EditVegetablePage() {
  return (
    <AppLayout title="Gestão Técnica — SELENE">
      <VegetableEdit />
    </AppLayout>
  );
}
