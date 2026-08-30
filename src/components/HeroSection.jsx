import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '@/lib/useProducts';

// Hero TechMania — dark, text-only hero derived from `sections/hero.liquid`
// of the Shopify theme. No product photo: clean tagline, oversized title,
// short copy and a white pill CTA.
export default function HeroSection() {
  const { products, loading } = useCatalog();

  const hero = useMemo(() => {
    const find = (re) => products.find((p) => re.test(String(p.name || '')));
    return find(/iPhone 17 Pro/i)
      || find(/iPhone 17/i)
      || products.find((p) => p.featured)
      || products[0]
      || null;
  }, [products]);

  const title = hero?.name || 'IPHONE 15 PRO';
  const subtitle = hero?.subtitle || 'Oltre ogni limite.';
  const description = hero?.description
    || 'Fotocamera di livello professionale, chip ultraveloce e design in titanio di grado aerospaziale.';
  const href = hero ? `/scheda-prodotto?id=${encodeURIComponent(hero.id)}` : '/catalogo';

  return (
    <section className="tm-hero" aria-labelledby="hero-title">
      <div className="container-tm">
        <div className="mx-auto max-w-4xl text-center">
          <span className="tm-hero-tag">{loading ? 'Loading…' : 'Oltre Ogni Limite'}</span>
          <h1 id="hero-title" className="tm-hero-title">{title}</h1>
          <p className="tm-hero-desc mx-auto">{subtitle} {description}</p>
          <Link to={href} className="tm-btn-primary">
            Acquista Ora
            <ArrowRight className="ml-2" size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
