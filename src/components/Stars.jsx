export default function Stars({ rating = 5 }) {
  return (
    <div className="stars" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? "filled" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}
