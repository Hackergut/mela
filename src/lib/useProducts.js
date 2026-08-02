import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Product.list('-sort_order', 500);
      setProducts(list);
      setError(null);
    } catch (e) {
      setError(e.message || 'Errore caricamento prodotti');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { products, loading, error, reload: load };
}