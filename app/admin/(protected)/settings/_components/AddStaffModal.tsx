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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/hooks/useUsers";
import type { Role } from "@prisma/client";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddStaffModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddStaffModal({ open, setOpen }: AddStaffModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "DENTIST" as Role,
  });
  const createUser = useCreateUser();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    createUser.mutate(newUser, {
      onSuccess: () => {
        setOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "DENTIST" });
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
          const fe: Record<string, string> = {};
          for (const [k, msgs] of Object.entries(e.data.error.fieldErrors)) {
            fe[k] = (msgs as string[])[0];
          }
          setErrors(fe);
        }
        if (typeof e.data?.error === "string") {
          toast.error(e.data.error);
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4" /> Dodaj
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj osoblje</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Ime i prezime *</Label>
            <Input
              value={newUser.name}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, name: e.target.value }))
              }
              placeholder="Dr. Ime Prezime"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, email: e.target.value }))
              }
              placeholder="email@dentcare.rs"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Lozinka *</Label>
            <PasswordInput
              value={newUser.password}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, password: e.target.value }))
              }
              placeholder="Min. 6 karaktera"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Uloga</Label>
            <Select
              value={newUser.role}
              onValueChange={(v) =>
                setNewUser((u) => ({ ...u, role: v as Role }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DENTIST">Stomatolog</SelectItem>
                <SelectItem value="ASSISTANT">Asistent</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
      </DialogContent>
    </Dialog>
  );
}
