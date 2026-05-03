export default function BikeVisual({ accent, compact = false }) {
  return (
    <div className={`bike-visual ${compact ? "bike-visual--compact" : ""}`}>
      <div className="bike-visual__glow" style={{ background: accent }} />
      <div className="bike-visual__frame">
        <div className="wheel wheel--left" />
        <div className="wheel wheel--right" />
        <div className="bike-line bike-line--top" />
        <div className="bike-line bike-line--mid" />
        <div className="bike-line bike-line--seat" />
        <div className="bike-line bike-line--fork" />
        <div className="bike-line bike-line--rear" />
        <div className="bike-line bike-line--handle" />
      </div>
    </div>
  );
}
