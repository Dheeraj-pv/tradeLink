interface Props {
  title: string;
  description: string;
}

export function JobDetailCard({ title, description }: Props) {
  return (
    <div className="detail-card">
      <h2 className="detail-card-title">{title}</h2>
      <p className="detail-card-text">{description}</p>
    </div>
  );
}
