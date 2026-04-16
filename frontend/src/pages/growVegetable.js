// Página administrativa preservada por compatibilidade de rota.
import AppLayout from '@/components/AppLayout/AppLayout';

import VegetableForm from '@/components/VegetableForm/VegetableForm';

export default function GrowVegetable() {
  return (
    <AppLayout title="Administração do Cultivo — SELENE">
      <VegetableForm />
    </AppLayout>
  );
}