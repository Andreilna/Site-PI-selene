export default function ErrorState({ message = "Ocorreu um erro ao carregar os dados.", onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "16px" }} role="alert">
      <p>{message}</p>
      {typeof onRetry === "function" && (
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

