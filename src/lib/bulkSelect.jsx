import { useMemo, useState } from 'react';
import { Trash2, X } from 'lucide-react';

/**
 * Shared checkbox-selection state for CMS tables.
 * @param {Array<{ id: string | number }>} items visible rows in the table
 */
export function useBulkSelect(items = []) {
  const [selected, setSelected] = useState(/** @type {Record<string, boolean>} */ ({}));
  const ids = useMemo(() => items.map((item) => String(item.id)), [items]);
  const selectedIds = useMemo(() => ids.filter((id) => selected[id]), [ids, selected]);
  const allSelected = ids.length > 0 && ids.every((id) => selected[id]);
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleOne = (id) => {
    const key = String(id);
    setSelected((current) => ({ ...current, [key]: !current[key] }));
  };
  const toggleAll = () => {
    setSelected((current) => {
      const next = { ...current };
      if (allSelected) ids.forEach((id) => delete next[id]);
      else ids.forEach((id) => { next[id] = true; });
      return next;
    });
  };
  const clear = () => setSelected({});

  return { selected, selectedIds, allSelected, someSelected, toggleOne, toggleAll, clear };
}

/**
 * @param {{ count: number, onBulkDelete: () => void, onClear: () => void, deleteLabel?: string }} props
 */
export function BulkActionBar({ count, onBulkDelete, onClear, deleteLabel = 'Elimina' }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 bg-[#0071E3]/10 border border-[#0071E3]/30 rounded-xl px-3 py-2">
      <span className="text-sm font-semibold text-[#0071E3]">{count} selezionati</span>
      <button onClick={onBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
        <Trash2 size={13} /> {deleteLabel}
      </button>
      <button onClick={onClear} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2 flex items-center gap-1">
        <X size={12} /> Annulla
      </button>
    </div>
  );
}

/**
 * @param {{ checked: boolean, indeterminate?: boolean, onChange: React.ChangeEventHandler<HTMLInputElement> }} props
 */
export function SelectAllCheckbox({ checked, indeterminate = false, onChange }) {
  return (
    <input
      type="checkbox"
      aria-label="Seleziona tutti"
      checked={checked}
      ref={(element) => { if (element) element.indeterminate = indeterminate; }}
      onChange={onChange}
      className="w-4 h-4 accent-[#0071E3] cursor-pointer"
    />
  );
}

/**
 * @param {{ checked: boolean, onChange: React.ChangeEventHandler<HTMLInputElement> }} props
 */
export function RowCheckbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      aria-label="Seleziona riga"
      checked={checked}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      className="w-4 h-4 accent-[#0071E3] cursor-pointer"
    />
  );
}
