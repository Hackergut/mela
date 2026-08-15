import { Component } from 'react';

/**
 * Last-resort UI for render-time failures. Keeping this boundary outside all
 * providers means a broken route, provider, or third-party component cannot
 * collapse the storefront into an unexplained blank page.
 */
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Storefront render failed:', error, info);
  }

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-6 py-16 text-[#1d1d1f]"
        role="alert"
      >
        <section className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-12">
          <p className="mb-3 text-sm font-semibold text-[#6e6e73]">Store non disponibile</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Non è stato possibile mostrare questa pagina.
          </h1>
          <p className="mt-4 leading-7 text-[#6e6e73]">
            Ricarica la pagina. Se il problema continua, comunica il messaggio diagnostico all’assistenza.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
            >
              Ricarica
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center rounded-full bg-[#e8e8ed] px-5 py-3 text-sm font-semibold transition hover:bg-[#dedee3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
            >
              Torna alla home
            </a>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-8 rounded-2xl bg-[#f5f5f7] p-4 text-left">
              <summary className="cursor-pointer text-sm font-semibold">Dettagli diagnostici</summary>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-[#6e6e73]">
                {error instanceof Error ? error.stack || error.message : String(error)}
              </pre>
            </details>
          )}
        </section>
      </main>
    );
  }
}
