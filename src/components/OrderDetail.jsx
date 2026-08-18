import React from 'react';
import { Check, Clock, Package, PackageCheck, Truck, XCircle, ExternalLink } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatPriceCents } from '@/lib/catalog';
import {
  buildOrderTimeline,
  carrierTrackingUrl,
  formatOrderDate,
  orderItemLabel,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
} from '@/lib/orders';

const STEP_ICONS = { pending: Clock, paid: Check, shipped: Truck, delivered: PackageCheck };

export function OrderStatusBadge({ status }) {
  const label = ORDER_STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_TONES[status] || 'bg-[#f5f5f7] text-[#1d1d1f]'}`}>
      {label}
    </span>
  );
}

export function OrderTimeline({ order }) {
  const steps = buildOrderTimeline(order);
  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start" aria-label="Stato dell'ordine">
      {steps.map((step, index) => {
        const Icon = step.terminal ? XCircle : STEP_ICONS[step.key] || Package;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="flex flex-1 gap-3 sm:flex-col sm:gap-2">
            <div className="flex flex-col items-center sm:flex-row sm:w-full sm:gap-2">
              <span
                aria-hidden="true"
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${
                  step.state === 'todo'
                    ? 'border-[#d2d2d7] bg-white text-[#a1a1a6]'
                    : step.terminal
                      ? 'border-[#ffc9c2] bg-[#ffebe8] text-[#d70015]'
                      : 'border-[#0071e3] bg-[#0071e3] text-white'
                }`}
              >
                <Icon size={16} />
              </span>
              {!isLast && (
                <span aria-hidden="true" className={`hidden h-0.5 flex-1 sm:block ${step.state === 'done' ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'}`} />
              )}
              {!isLast && <span aria-hidden="true" className={`h-full w-0.5 flex-1 sm:hidden ${step.state === 'done' ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'} mx-[17px] my-1`} />}
            </div>
            <div className="pb-5 sm:pb-0">
              <p className={`text-sm font-semibold ${step.state === 'todo' ? 'text-[#a1a1a6]' : 'text-[#1d1d1f]'}`}>
                {step.label}
                {step.state === 'current' && !step.terminal && <span className="sr-only"> (stato attuale)</span>}
              </p>
              {step.date && <p className="text-xs text-[#6e6e73]">{formatOrderDate(step.date)}</p>}
              {step.key === 'shipped' && order.carrier && (
                <p className="mt-1 text-xs text-[#6e6e73]">Corriere: {order.carrier}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Address({ address, name }) {
  const parts = [name, address?.line1, address?.line2, [address?.postal_code, address?.city].filter(Boolean).join(' '), address?.state, address?.country].filter(Boolean);
  return parts.length ? <p className="text-sm leading-relaxed text-[#1d1d1f]">{parts.join(', ')}</p> : <p className="text-sm text-[#86868b]">—</p>;
}

export default function OrderDetail({ order }) {
  const trackingUrl = carrierTrackingUrl(order.carrier, order.tracking_number);
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6e6e73]">Ordine</p>
          <p className="font-mono text-lg font-semibold text-[#1d1d1f]">{order.order_number}</p>
          {order.created_date && <p className="text-xs text-[#6e6e73]">del {formatOrderDate(order.created_date)}</p>}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-3xl bg-[#f5f5f7] p-5 sm:p-6">
        <OrderTimeline order={order} />
        {trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0071e3]"
          >
            <Truck size={16} aria-hidden="true" /> Traccia la spedizione ({order.tracking_number}) <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="order-items" className="rounded-3xl border border-[#d2d2d7] p-5 sm:p-6">
          <h2 id="order-items" className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">Articoli</h2>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={`${item.sku || item.name}-${index}`} className="flex items-center gap-3">
                {item.image ? (
                  <Image src={item.image} alt="" fittingType="fit" className="h-14 w-14 shrink-0 rounded-2xl bg-white object-contain" />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f5f5f7]"><Package size={18} className="text-[#86868b]" aria-hidden="true" /></span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1d1d1f]">{orderItemLabel(item)}</p>
                  <p className="text-xs text-[#6e6e73]">Quantità: {item.qty}</p>
                </div>
                <p className="text-sm font-semibold text-[#1d1d1f]">{formatPriceCents(item.price_cents * item.qty)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="order-totals" className="rounded-3xl border border-[#d2d2d7] p-5 sm:p-6">
            <h2 id="order-totals" className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">Riepilogo</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[#6e6e73]">Subtotale</dt><dd className="text-[#1d1d1f]">{formatPriceCents(order.subtotal_cents)}</dd></div>
              {order.discount_amount_cents > 0 && (
                <div className="flex justify-between"><dt className="text-[#6e6e73]">Sconto {order.discount_code ? `(${order.discount_code})` : ''}</dt><dd className="text-[#248a3d]">−{formatPriceCents(order.discount_amount_cents)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-[#6e6e73]">Spedizione</dt><dd className="text-[#1d1d1f]">{order.shipping_cents > 0 ? formatPriceCents(order.shipping_cents) : 'Gratuita'}</dd></div>
              <div className="mt-2 flex justify-between border-t border-[#d2d2d7] pt-3 text-base font-semibold"><dt className="text-[#1d1d1f]">Totale</dt><dd className="text-[#1d1d1f]">{formatPriceCents(order.total_cents)}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="order-shipping" className="rounded-3xl border border-[#d2d2d7] p-5 sm:p-6">
            <h2 id="order-shipping" className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">Consegna</h2>
            <Address address={order.shipping_address} name={order.shipping_name || order.customer_name} />
            {order.customer_email_masked && <p className="mt-2 text-xs text-[#6e6e73]">Conferme inviate a {order.customer_email_masked}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
