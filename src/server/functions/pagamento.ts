import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const iniciarPagamentoFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      cvId: string;
      telefone: string;
      operadora: string;
      authToken: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Configuração do Supabase em falta no servidor.");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${data.authToken}`,
        },
      },
    });

    // Validar se o currículo existe e se pertence ao utilizador
    const { data: cv, error: cvErr } = await supabase
      .from("curriculos")
      .select("id, user_id, dados_pessoais")
      .eq("id", data.cvId)
      .single();

    if (cvErr || !cv) {
      throw new Error(`Currículo não encontrado ou sem permissão de acesso: ${cvErr?.message || 'Erro'}`);
    }

    const zumbopayApiKey = process.env.ZUMBOPAY_API_KEY;
    const zumbopayMerchantId = process.env.ZUMBOPAY_MERCHANT_ID;
    
    if (!zumbopayApiKey || !zumbopayMerchantId) {
      throw new Error("Configuração da ZumboPay em falta no servidor.");
    }

    const walletId = data.operadora === "emola"
      ? process.env.ZUMBOPAY_EMOLA_WALLET_ID
      : process.env.ZUMBOPAY_MPESA_WALLET_ID;

    if (!walletId) {
      throw new Error(`Identificador de carteira para ${data.operadora.toUpperCase()} não configurado no servidor.`);
    }

    // Normalizar telefone para incluir o indicativo 258
    let msisdn = data.telefone.replace(/\D/g, "");
    if (msisdn && !msisdn.startsWith("258")) {
      msisdn = "258" + msisdn;
    }

    const dp = (cv.dados_pessoais as Record<string, any>) || {};
    const customerName = dp.nome || "Candidato Moz Carreira";

    const response = await fetch("https://zumbopay.com/api/public/v1/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${zumbopayApiKey}`,
        "X-Merchant-Id": zumbopayMerchantId,
      },
      body: JSON.stringify({
        wallet_id: walletId,
        amount: 150, // Taxa única de 150 MT
        msisdn: msisdn,
        customer_name: customerName,
        source_id: data.cvId,
      }),
    });

    const resData = await response.json();
    console.log("ZUMBOPAY CHARGE RESPONSE:", JSON.stringify(resData));

    if (!response.ok || resData.error || resData.message === "Unauthorized") {
      const errMsg = resData.error?.message || resData.message || "Erro ao processar cobrança na ZumboPay.";
      throw new Error(errMsg);
    }

    const ref = resData.data?.reference || resData.data?.id || resData.reference || resData.id;
    if (!ref) {
      throw new Error("Nenhuma referência de transação retornada pela ZumboPay.");
    }

    return { success: true, reference: ref };
  });

export const verificarPagamentoFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      reference: string;
      cvId: string;
      authToken: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const zumbopayApiKey = process.env.ZUMBOPAY_API_KEY;
    const zumbopayMerchantId = process.env.ZUMBOPAY_MERCHANT_ID;
    
    if (!zumbopayApiKey || !zumbopayMerchantId) {
      throw new Error("Configuração da ZumboPay em falta no servidor.");
    }

    const response = await fetch(`https://zumbopay.com/api/public/v1/payments/${data.reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${zumbopayApiKey}`,
        "X-Merchant-Id": zumbopayMerchantId,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao consultar estado do pagamento na ZumboPay.");
    }

    const resData = await response.json();
    const rawStatus = (resData.data?.status || resData.status || "").toLowerCase();
    const isPaid = ["success", "succeeded", "paid"].includes(rawStatus);

    if (isPaid) {
      // Atualizar o estado de pago no Supabase
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Configuração do Supabase em falta no servidor.");
      }

      const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${data.authToken}`,
          },
        },
      });

      const { error: updateErr } = await supabase
        .from("curriculos")
        .update({ pago: true })
        .eq("id", data.cvId);

      if (updateErr) {
        console.error("Erro ao atualizar curriculo para pago:", updateErr);
        throw new Error(`Erro ao atualizar estado do currículo: ${updateErr.message}`);
      }
    }

    return { paid: isPaid, status: rawStatus };
  });
