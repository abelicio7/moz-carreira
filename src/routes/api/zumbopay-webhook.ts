import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/zumbopay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Content-Type": "application/json",
        };

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
        // Webhooks use the service role key to securely bypass RLS and toggle the payment flag
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

        if (!supabaseUrl || !supabaseKey) {
          return new Response(JSON.stringify({ error: "Configuração do Supabase em falta no servidor." }), {
            status: 500,
            headers: corsHeaders,
          });
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseKey);

        try {
          const rawBody = await request.text();
          const signature = request.headers.get("x-zumbopay-signature");
          const webhookSecret = process.env.ZUMBOPAY_WEBHOOK_SECRET;

          console.log("ZumboPay Webhook Signature Received:", signature);

          let body: any = {};
          try {
            body = JSON.parse(rawBody);
          } catch (parseErr) {
            console.error("Failed to parse body JSON:", parseErr);
          }

          // Validation (HMAC-SHA256 of the raw body)
          if (webhookSecret) {
            const hmac = crypto.createHmac("sha256", webhookSecret);
            hmac.update(rawBody);
            const calculatedHashRaw = hmac.digest("hex");

            const isRawMatch = signature && (calculatedHashRaw.toLowerCase() === signature.toLowerCase());

            if (!isRawMatch) {
              console.error(`INVALID WEBHOOK SIGNATURE. Hash mismatch. Raw calculated: ${calculatedHashRaw}, received: ${signature}`);
              return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: corsHeaders });
            }
            console.log("Webhook signature validated successfully.");
          } else {
            console.warn("ZUMBOPAY_WEBHOOK_SECRET not set. Skipping signature validation.");
          }

          const event = body.event || body.event_type || body.type;
          const data = body.data || body;

          // The source_id/reference is the CV ID we sent in ZumboPay charge body
          const reference = data?.source_id || data?.reference || data?.transaction_reference || data?.id || body?.reference || body?.transaction_reference || body?.id;
          const status = (data?.status || body?.status || "").toLowerCase();

          console.log(`Processing ZumboPay event: ${event} for reference: ${reference}, status: ${status}`);

          const isSuccessEvent = event === "payment.succeeded" || event === "charge.succeeded" || event === "charge.success" || event === "payment.completed";
          const isSuccessStatus = status === "success" || status === "succeeded" || status === "paid" || status === "completed";

          if (isSuccessEvent || (reference && isSuccessStatus)) {
            if (reference) {
              console.log(`Atualizando currículo ${reference} para pago...`);
              const { error: updateErr } = await supabase
                .from("curriculos")
                .update({ pago: true })
                .eq("id", reference);

              if (updateErr) {
                console.error("Erro ao atualizar currículo para pago no webhook:", updateErr);
                return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: corsHeaders });
              }
              console.log(`Currículo ${reference} marcado como pago com sucesso!`);
            }
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: corsHeaders,
          });

        } catch (error: any) {
          console.error("Webhook processing error:", error.message);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders,
          });
        }
      },
    },
  },
});
