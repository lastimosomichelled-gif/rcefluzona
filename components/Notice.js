export default function Notice({ ok, error }) {
  return (
    <>
      {ok ? <div className="notice ok">{ok}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}
    </>
  );
}
