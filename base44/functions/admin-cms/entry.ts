import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const body = await req.json();
    const { password, operation, resource, payload } = body;

    if (!password || password !== secrets.get("ADMIN_PASSWORD")) {
      return Response.json({ error: "Password non valida" }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const dbMap = {
      product: base44.asServiceRole.entities.Product,
      category: base44.asServiceRole.entities.Category,
      asset: base44.asServiceRole.entities.Asset,
      order: base44.asServiceRole.entities.Order,
      discount: base44.asServiceRole.entities.Discount,
      customer: base44.asServiceRole.entities.Customer,
      user: base44.asServiceRole.entities.User,
    };
    const res = resource || 'product';
    const db = dbMap[res];
    if (!db) return Response.json({ error: "Risorsa non valida" }, { status: 400 });

    const sortMap = {
      product: '-sort_order', category: 'sort_order', asset: '-created_date',
      order: '-created_date', discount: '-created_date', customer: '-created_date', user: '-created_date',
    };

    switch (operation) {
      case "list": {
        const items = await db.list(sortMap[res] || '-created_date', 500);
        return Response.json({ items });
      }
      case "create": {
        let data = { ...(payload || {}) };
        if (res === 'discount' && data.code) data.code = String(data.code).trim().toUpperCase();
        if (res === 'product') {
          if (data.price_cents !== undefined) data.price_cents = Number(data.price_cents);
          if (data.cost_cents !== undefined) data.cost_cents = Number(data.cost_cents);
          if (data.stock !== undefined) data.stock = Number(data.stock);
          if (data.low_stock_threshold !== undefined) data.low_stock_threshold = Number(data.low_stock_threshold);
        }
        const item = await db.create(data);
        return Response.json({ item });
      }
      case "update": {
        const { id, ...data } = payload || {};
        if (!id) return Response.json({ error: "ID mancante" }, { status: 400 });
        if (res === 'discount' && data.code) data.code = String(data.code).trim().toUpperCase();
        if (res === 'product') {
          ['price_cents', 'cost_cents', 'stock', 'low_stock_threshold', 'sort_order'].forEach(k => {
            if (data[k] !== undefined) data[k] = Number(data[k]);
          });
        }
        const item = await db.update(id, data);
        return Response.json({ item });
      }
      case "delete": {
        const { id } = payload || {};
        if (!id) return Response.json({ error: "ID mancante" }, { status: 400 });
        await db.delete(id);
        return Response.json({ ok: true });
      }
      case "invite_user": {
        const { email, role } = payload || {};
        if (!email) return Response.json({ error: "Email mancante" }, { status: 400 });
        await base44.asServiceRole.users.inviteUser(email, role || "user");
        return Response.json({ ok: true });
      }
      default:
        return Response.json({ error: "Operazione non valida" }, { status: 400 });
    }
  } catch (error) {
    console.error("admin-cms error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}