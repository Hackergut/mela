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
    };
    const res = resource || 'product';
    const db = dbMap[res];
    if (!db) return Response.json({ error: "Risorsa non valida" }, { status: 400 });

    switch (operation) {
      case "list": {
        const sort = res === 'category' ? 'sort_order' : (res === 'asset' ? '-created_date' : '-sort_order');
        const items = await db.list(sort, 500);
        return Response.json({ items });
      }
      case "create": {
        const item = await db.create(payload || {});
        return Response.json({ item });
      }
      case "update": {
        const { id, ...data } = payload || {};
        if (!id) return Response.json({ error: "ID mancante" }, { status: 400 });
        if (data.price_cents !== undefined) data.price_cents = Number(data.price_cents);
        if (data.sort_order !== undefined) data.sort_order = Number(data.sort_order);
        const item = await db.update(id, data);
        return Response.json({ item });
      }
      case "delete": {
        const { id } = payload || {};
        if (!id) return Response.json({ error: "ID mancante" }, { status: 400 });
        await db.delete(id);
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