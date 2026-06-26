"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { periodoLetivoService } from "@/services/entities";
import type { PeriodoLetivo } from "@/types/entities";
import { useRouter } from "next/navigation";
import { Timer, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [periodos, setPeriodos] = useState<PeriodoLetivo[]>([]);
  const [errorPeriodo, setErrorPeriodo] = useState<string | null>(null);

  const [periodoSelecionadoId, setPeriodoSelecionadoId] = useState<string>("");
  const [advanceForm, setAdvanceForm] = useState<{
    nome: string;
    data_inicio: string;
    data_fim: string;
  }>({ nome: "", data_inicio: "", data_fim: "" });

  useEffect(() => {
    async function fetchPeriodos() {
      if (user?.role !== "ADMIN") return;
      try {
        const resp = await periodoLetivoService.list();
        setPeriodos(resp.periodos || []);
        if (!periodoSelecionadoId && resp.periodos?.length) {
          const ativo = resp.periodos.find((p) => p.ativo);
          setPeriodoSelecionadoId(ativo?.id || resp.periodos[0].id);
        }
      } catch {
        setPeriodos([]);
      }
    }

    fetchPeriodos();
  }, [user?.role, periodoSelecionadoId]);

  const periodoSelecionado = useMemo(() => {
    return periodos.find((p) => p.id === periodoSelecionadoId) || null;
  }, [periodos, periodoSelecionadoId]);
  const periodoAtivo = useMemo(() => {
    return periodos.find((p) => p.ativo) || null;
  }, [periodos]);

  async function handleAvancarPeriodo() {
    if (user?.role !== "ADMIN") return;
    if (!advanceForm.nome || !advanceForm.data_inicio || !advanceForm.data_fim) {
      setErrorPeriodo("Preencha nome, data início e data fim");
      return;
    }
    setErrorPeriodo(null);
    try {
      await periodoLetivoService.advance(advanceForm);
      const listResp = await periodoLetivoService.list();
      setPeriodos(listResp.periodos || []);
      setAdvanceForm({ nome: "", data_inicio: "", data_fim: "" });
    } catch (err: unknown) {
      setErrorPeriodo(err instanceof Error ? err.message : "Falha ao avançar período letivo");
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Ajustes operacionais do sistema</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          {user?.role === "ADMIN" && (
            <Card>
              <CardHeader>
                <CardTitle>Ações de Admin</CardTitle>
                <CardDescription>
                  Consulte os períodos já criados e avance para o próximo quando o período atual
                  encerrar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {errorPeriodo && <p className="text-sm text-destructive">{errorPeriodo}</p>}

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Período ativo no momento
                  </p>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {periodoAtivo?.nome || "Nenhum período ativo"}
                  </p>
                  {periodoAtivo && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Vigência: {periodoAtivo.data_inicio} até {periodoAtivo.data_fim}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Períodos anteriores podem ser consultados na página de grade de horários.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Períodos criados</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Esta lista é apenas informativa para consulta do histórico cadastrado.
                    </p>
                  </div>
                  <Select value={periodoSelecionadoId} onValueChange={setPeriodoSelecionadoId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} ({p.status}) {p.ativo ? "- ativo" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {periodoSelecionado && (
                    <div className="rounded-lg border p-4">
                      <p className="text-sm font-medium text-foreground">
                        {periodoSelecionado.nome}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Status: {periodoSelecionado.status}</p>
                        <p>
                          Vigência: {periodoSelecionado.data_inicio} até{" "}
                          {periodoSelecionado.data_fim}
                        </p>
                        <p>
                          Situação operacional:{" "}
                          {periodoSelecionado.ativo ? "Período atualmente ativo" : "Período não ativo"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Avançar período</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use esta ação apenas ao iniciar um novo período letivo. O período atual será
                      encerrado e o novo passará a ser o período ativo do sistema.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      className="sm:col-span-3"
                      value={advanceForm.nome}
                      onChange={(e) => setAdvanceForm((s) => ({ ...s, nome: e.target.value }))}
                      placeholder="Nome (ex.: 2026.2)"
                    />
                    <Input
                      type="date"
                      value={advanceForm.data_inicio}
                      onChange={(e) =>
                        setAdvanceForm((s) => ({ ...s, data_inicio: e.target.value }))
                      }
                    />
                    <Input
                      type="date"
                      value={advanceForm.data_fim}
                      onChange={(e) =>
                        setAdvanceForm((s) => ({ ...s, data_fim: e.target.value }))
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full">
                          <Timer className="h-4 w-4 mr-2" />
                          Avançar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar avanço de período</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao confirmar, o período ativo atual será encerrado e o novo período
                            informado passará a ser usado nas operações do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleAvancarPeriodo}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
