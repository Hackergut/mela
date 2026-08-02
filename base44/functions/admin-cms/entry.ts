import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const body = await req.json();
    const { password, operation, payload } = body;

    if (!password || password !== secrets.get("ADMIN_PASSWORD")) {
      return Response.json({ error: "Password non valida" }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities.Product;

    switch (operation) {
      case "list": {
        const items = await db.list('-sort_order', 500);
        return Response.json({ products: items });
      }
      case "create": {
        const { name, price, price_cents, badge, category, image, images, colors, description, sort_order } = payload || {};
        if (!name || !price || !category || !image) {
          return Response.json({ error: "Nome, prezzo, categoria e immagine sono obbligatori" }, { status: 400 });
        }
        const created = await db.create({
          name, price,
          price_cents: Number(price_cents) || 0,
          badge: badge || null,
          category,
          image,
          images: images || [],
          colors: colors || [],
          description: description || "",
          sort_order: Number(sort_order) || 0,
        });
        return Response.json({ product: created });
      }
      case "update": {
        const { id, ...data } = payload || {};
        if (!id) return Response.json({ error: "ID mancante" }, { status: 400 });
        if (data.price_cents !== undefined) data.price_cents = Number(data.price_cents);
        if (data.sort_order !== undefined) data.sort_order = Number(data.sort_order);
        const updated = await db.update(id, data);
        return Response.json({ product: updated });
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