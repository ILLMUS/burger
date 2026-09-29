import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
  phone: z.string().trim().min(4).max(30),
});

/** Looks up a single order by order number + matching phone number (two-factor guest lookup). */
export const lookupOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const digits = data.phone.replace(/\D/g, "");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, customer_name, phone, order_type, address, instructions, subtotal, delivery_fee, total, status, payment_status, created_at, order_items(id, product_name, quantity, price, subtotal)",
      )
      .eq("order_number", data.orderNumber.toUpperCase())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!order) return null;

    const stored = String((order as { phone?: string }).phone ?? "").replace(/\D/g, "");
    if (!stored || !digits || !(stored.endsWith(digits) || digits.endsWith(stored))) return null;

    return order;
  });
