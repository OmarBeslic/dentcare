"use client";

import { useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  useCreateToothRecord,
  useUpdateToothRecord,
} from "@/hooks/useToothRecords";
import type { ToothRecordDTO } from "@/types";
import { lowerJaw, serviceOptions, upperJaw } from "./tooth-chart/constants";

// Client side validation schema for the form widgets. Distinct from the servers
// toothRecordSchema (which uses z.coerce for raw request bodies) since every field
// here is already produced as its target type by the corresponding form control
const formSchema = z.object({
  visitDate: z.string().min(1, "Datum posete je obavezan"),
  treatedTeeth: z.array(z.number()).min(1, "Izaberite bar jedan zub"),
  diagnosis: z.string().optional(),
  serviceType: z.string().min(1, "Vrsta usluge je obavezna"),
  price: z.number().min(0, "Cena ne može biti negativna"),
  isPaid: z.boolean(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function MiniToothSelector({
  value,
  onChange,
}: {
  value: number[];
  onChange: (teeth: number[]) => void;
}) {
  function toggle(tooth: number) {
    onChange(
      value.includes(tooth)
        ? value.filter((t) => t !== tooth)
        : [...value, tooth],
    );
  }

  function renderRow(row: number[]) {
    return (
      <div className="grid grid-cols-16 gap-0.5 sm:gap-1">
        {row.map((tooth) => (
          <button
            key={tooth}
            type="button"
            onClick={() => toggle(tooth)}
            className={cn(
              "aspect-square rounded-md border text-[7px] sm:text-[9px] font-medium transition-colors",
              value.includes(tooth)
                ? "bg-primary-light border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {tooth}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {renderRow(upperJaw)}
      {renderRow(lowerJaw)}
    </div>
  );
}

function subscribeDesktopQuery(callback: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getDesktopSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches;
}
function getDesktopServerSnapshot() {
  return false;
}
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktopQuery,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );
}

interface TreatmentFormProps {
  patientId: string;
  clinicId: string;
  record?: ToothRecordDTO;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TreatmentForm({
  patientId,
  record,
  onSuccess,
  onCancel,
}: TreatmentFormProps) {
  const isDesktop = useIsDesktop();
  const isEdit = !!record;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitDate: record
        ? format(new Date(record.visitDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      treatedTeeth: record?.treatedTeeth ?? [],
      diagnosis: record?.diagnosis ?? "",
      serviceType: record?.serviceType ?? "",
      price: record ? Number(record.price ?? 0) : 0,
      isPaid: record?.isPaid ?? false,
      notes: record?.notes ?? "",
    },
  });

  const create = useCreateToothRecord(patientId);
  const update = useUpdateToothRecord(patientId, record?.id ?? "");
  const isPending = create.isPending || update.isPending;

  function onSubmit(values: FormValues) {
    if (isEdit) {
      update.mutate(values, { onSuccess });
    } else {
      create.mutate(values, { onSuccess });
    }
  }

  const body = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="visitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datum posete *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatedTeeth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tretirani zubi *</FormLabel>
              <MiniToothSelector
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dijagnoza</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vrsta usluge *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite uslugu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cijena</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pr-8 no-spinner"
                      {...field}
                      onChange={(e) => {
                        const next = e.target.valueAsNumber || 0;
                        field.onChange(next);
                        e.target.value = String(next);
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPaid"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-3 space-y-0">
              <FormLabel className="mt-0!">Plaćeno</FormLabel>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Napomene</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Čuvanje...
              </>
            ) : (
              "Sačuvaj tretman"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Otkaži
          </Button>
        </div>
      </form>
    </Form>
  );

  const title = isEdit ? "Uredi tretman" : "Dodaj tretman";

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(o) => !o && onCancel()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{body}</div>
      </SheetContent>
    </Sheet>
  );
}
