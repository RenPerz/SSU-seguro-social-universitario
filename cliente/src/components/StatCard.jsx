export default function StatCard({ title, value, caption, tone = 'blue' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__meta">{title}</div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__caption">{caption}</div>
    </article>
  );
}
