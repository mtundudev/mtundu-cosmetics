import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-32 text-center">
      <p className="section-eyebrow">Hitilafu 404</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
        Samahani, ukurasa huu haupo.
      </h1>
      <p className="mt-3 max-w-sm text-sm text-charcoal/70">
        Huenda ukurasa umehamishwa au haujawahi kuwepo. Rudi nyumbani kuendelea kuvinjari.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Rudi Nyumbani
      </Link>
    </div>
  );
}
