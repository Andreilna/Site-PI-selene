export default function EmptyState({ message = "Nenhum dado disponível no momento." }) {
  return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      <p>{message}</p>
    </div>
  );
}

