type StructuredDataScriptsProps = {
  entries: Array<Record<string, unknown>>;
};

export function StructuredDataScripts({ entries }: StructuredDataScriptsProps) {
  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry),
          }}
        />
      ))}
    </>
  );
}
