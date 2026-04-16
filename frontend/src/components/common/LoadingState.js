import homeStyles from "@/styles/Home.module.css";

export default function LoadingState({ message = "Carregando..." }) {
  return (
    <div className={homeStyles.loadingScreen} role="status" aria-live="polite">
      <div className={homeStyles.spinner} />
      <p>{message}</p>
    </div>
  );
}

