export const EmptyState = ({
  title,
  description,
  action,
}) => (
  <div className="glass-card flex flex-col items-center px-6 py-12 text-center">
    <h2 className="section-title text-2xl">{title}</h2>
    <p className="section-copy mt-3 max-w-xl">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
