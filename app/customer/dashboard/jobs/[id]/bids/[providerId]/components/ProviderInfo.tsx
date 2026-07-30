import type { Provider } from "../types";

interface Props {
  provider: Provider;
}

export function ProviderInfo({ provider }: Props) {
  return (
    <div className="profile-body">
      {provider.bio && (
        <section>
          <h2>About</h2>
          <p>{provider.bio}</p>
        </section>
      )}

      {provider.phone && (
        <section>
          <h2>Contact</h2>
          <p>📞 {provider.phone}</p>
        </section>
      )}
    </div>
  );
}
