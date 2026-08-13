import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Smartphone, ShieldCheck, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { iniciarPagamentoFn, verificarPagamentoFn } from "@/server/functions/pagamento";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cvId: string;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, cvId, onSuccess }: Props) {
  const [operadora, setOperadora] = useState("mpesa");
  const [telefone, setTelefone] = useState("");
  const [estado, setEstado] = useState<"dados" | "processando" | "pin" | "sucesso">("dados");
  const pollIntervalRef = useRef<number | null>(null);

  const iniciarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefone.match(/^(82|83|84|85|86|87)\d{7}$/)) {
      toast.error("Por favor, introduza um número de telemóvel válido de Moçambique.");
      return;
    }

    setEstado("processando");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada. Inicie sessão novamente.");
      }

      const res = await iniciarPagamentoFn({
        cvId,
        telefone,
        operadora,
        authToken: session.access_token,
      });

      if (!res.success) {
        throw new Error("Erro ao processar cobrança.");
      }

      setEstado("pin");

      // Começar a sondar (polling) o estado do pagamento a cada 3 segundos
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const check = await verificarPagamentoFn({
            reference: res.reference,
            cvId,
            authToken: session.access_token,
          });

          if (check.paid) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            localStorage.setItem(`pago_cv_${cvId}`, "true");
            setEstado("sucesso");
            setTimeout(() => {
              onSuccess();
              toast.success("Exportação de PDF desbloqueada!");
              resetar();
              onClose();
            }, 1500);
          } else if (["failed", "cancelled", "rejected"].includes(check.status)) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            toast.error(`O pagamento falhou ou foi cancelado (Estado: ${check.status}).`);
            resetar();
          }
        } catch (pollErr) {
          console.error("Erro ao verificar pagamento:", pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);
      toast.error(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
      setEstado("dados");
    }
  };

  const resetar = () => {
    setEstado("dados");
    setTelefone("");
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetar(); onClose(); } }}>
      <DialogContent className="sm:max-w-[420px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="h-5 w-5 text-primary" />
            Desbloquear Currículo 🚀
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2">
            Obtenha o seu currículo profissional completo nas normas A4, sem marca de água e com downloads ilimitados por uma taxa única de <strong>150 MT</strong>.
          </DialogDescription>
        </DialogHeader>

        {estado === "dados" && (
          <form onSubmit={iniciarPagamento} className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label>Selecione a Operadora</Label>
              <RadioGroup
                value={operadora}
                onValueChange={setOperadora}
                className="grid grid-cols-3 gap-3"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted cursor-pointer transition-smooth">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="font-semibold cursor-pointer">M-Pesa</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted cursor-pointer transition-smooth">
                  <RadioGroupItem value="emola" id="emola" />
                  <Label htmlFor="emola" className="font-semibold cursor-pointer">e-Mola</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted cursor-pointer transition-smooth">
                  <RadioGroupItem value="mkesh" id="mkesh" />
                  <Label htmlFor="mkesh" className="font-semibold cursor-pointer">M-Kesh</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefone">Número de Telemóvel</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="ex: 841234567"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Insira o número associado à conta móvel.</p>
            </div>

            <Button type="submit" className="w-full">
              Pagar 150 MT
            </Button>
          </form>
        )}

        {estado === "processando" && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="font-semibold">A iniciar transação...</p>
              <p className="text-xs text-muted-foreground">A enviar notificação de pagamento para o telemóvel {telefone}.</p>
            </div>
          </div>
        )}

        {estado === "pin" && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-pulse">
            <Smartphone className="h-12 w-12 text-primary" />
            <div className="space-y-1.5">
              <p className="font-semibold text-base">Autorize no Telemóvel</p>
              <p className="text-xs text-muted-foreground px-4">
                Introduza o seu PIN da conta móvel no telemóvel para autorizar o débito de 150 MT.
              </p>
            </div>
          </div>
        )}

        {estado === "sucesso" && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 text-green-600">
            <ShieldCheck className="h-14 w-14 animate-rise" />
            <div className="space-y-1">
              <p className="font-bold text-lg">Pagamento Confirmado!</p>
              <p className="text-xs text-muted-foreground">O descarregamento do seu currículo foi ativado.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
