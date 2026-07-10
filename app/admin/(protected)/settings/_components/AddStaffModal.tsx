"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateUser } from "@/hooks/useUsers";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { userSchema } from "@/lib/validations";

interface AddStaffModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type FormValues = z.infer<typeof userSchema>;

export default function AddStaffModal({ open, setOpen }: AddStaffModalProps) {
  const createUser = useCreateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "DENTIST",
    },
  });

  function onSubmit(values: FormValues) {
    createUser.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (err: unknown) => {
        const e = err as {
          status?: number;
          data?: {
            error?: { fieldErrors?: Record<string, string[]> } | string;
          };
        };
        if (
          e?.status === 400 &&
          typeof e.data?.error === "object" &&
          e.data.error?.fieldErrors
        ) {
          for (const [field, msgs] of Object.entries(e.data.error.fieldErrors)) {
            form.setError(field as keyof FormValues, { message: msgs[0] });
          }
        }
        if (typeof e.data?.error === "string") {
          toast.error(e.data.error);
        }
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4" /> Dodaj
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj osoblje</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime i prezime *</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Ime Prezime" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@dentcare.me" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lozinka *</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Min. 6 karaktera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uloga</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DENTIST">Stomatolog</SelectItem>
                      <SelectItem value="ASSISTANT">Asistent</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Otkaži
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Dodavanje...
                  </>
                ) : (
                  "Dodaj"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
