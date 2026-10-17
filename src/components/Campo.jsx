// así no repetimos la etiqueta y el mensaje de error en cada campo
export default function Campo({ id, etiqueta, ayuda, error, children }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && <small>{ayuda}</small>}
      <span id={id + "-error"} className="mensaje-error" aria-live="polite">
        {error}
      </span>
    </div>
  );
}
