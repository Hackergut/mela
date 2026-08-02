import { useState, useCallback } from 'react';
import { Trash2, X } from 'lucide-react';

/**
 * Hook riutilizzabile per selezione multipla con caselle.
 * @param items - array corrente di elementi (con campo `id`)
 * @returns { selected, selectedIds, toggleOne, toggleAll, clear, allSelected, someSelected }
 */
export function useBulkSelect(items = []) {
  const [selected, setSelected] = useState({});
  const ids = items.map(i => i.id);
  const selectedIds = ids.filter(id => selected[id]);
  const allSelected = ids.length > 0 && ids.every(id => selected[id]);
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleOne = useCallback((id) => {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(s => {
      const next = { ...s };
      if (ids.every(id => s[id])) ids.forEach(id => delete next[id]);
      else ids.forEach(id => { next[id] = true; });
      return next;
    });
  }, [ids.join(',')]);

  const clear = useCallback(() => setSelected({}), []);

  return { selected, selectedIds, toggleOne, toggleAll, clear, allSelected, someSelected };
}

/**
 * Barra azione bulk riutilizzabile. Mostra conteggio + bottone elimina.
 */
export function BulkActionBar({ count, onBulkDelete, onClear, deleteLabel = 'Elimina' }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl px-3 py-2">
      <span className="text-sm font-semibold text-[#FF6B35]">{count} selezionati</span>
      <button onClick={onBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
        <Trash2 size={13} /> {deleteLabel}
      </button>
      <button onClick={onClear} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2 flex items-center gap-1">
        <X size={12} /> Annulla
      </button>
    </div>
  );
}

/** Casella header "seleziona tutti" */
export function SelectAllCheckbox({ checked, indeterminate, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={el => { if (el) el.indeterminate = indeterminate; }}
      onChange={onChange}
      className="w-4 h-4 accent-[#FF6B35] cursor-pointer"
    />
  );
}

/** Casella singola riga */
export function RowCheckbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={e => e.stopPropagation()}
      className="w-4 h-4 accent-[#FF6B35] cursor-pointer"
    />
  );
}