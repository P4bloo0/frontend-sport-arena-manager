// bootstrap pone los paneles juntos o uno debajo del otro
export default function DosColumnas({ children }) {
  return (
    <div className="row fila-bootstrap">
      {children.map((panel, i) => (
        <div className="col-12 col-lg-6" key={i}>
          {panel}
        </div>
      ))}
    </div>
  );
}
