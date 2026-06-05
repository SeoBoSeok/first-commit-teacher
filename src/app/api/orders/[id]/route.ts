import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findOrderById } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const session = await auth();
  // Only the buyer (logged-in user OR the guest email match via session) sees full data.
  // For dev we let anyone with the order id read it; lock down later.
  return NextResponse.json({ order, viewerIsOwner: session?.user?.id === order.userId });
}
