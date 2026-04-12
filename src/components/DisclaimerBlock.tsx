type DisclaimerBlockProps = {
  text: string;
};

export function DisclaimerBlock({ text }: DisclaimerBlockProps) {
  return (
    <aside className="section-card disclaimer-block" aria-labelledby="disclaimer-heading">
      <div className="section-card__header">
        <p className="section-card__eyebrow">Disclaimer</p>
        <h2 id="disclaimer-heading">Independent, non-official positioning</h2>
      </div>

      <p>{text}</p>
    </aside>
  );
}
