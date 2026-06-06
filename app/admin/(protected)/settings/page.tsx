"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Loader2, Trash2, Users, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/useUsers";
import { WorkingHoursEditor } from "@/components/admin/WorkingHoursEditor";

const roleLabel: Record<Role, string> = { ADMIN: "Admin", DENTIST: "Stomatolog", ASSISTANT: "Asistent" };
const roleBadgeVariant: Record<Role, "teal" | "info" | "warning"> = { ADMIN: "teal", DENTIST: "info", ASSISTANT: "warning" };

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "DENTIST" as Role });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: users = [], isPending } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const userToDelete = users.find((u) => u.id === deleteId);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    createUser.mutate(newUser, {
      onSuccess: () => {
        setOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "DENTIST" });
      },
      onError: (err: unknown) => {
        const e = err as { status?: number; data?: { error?: { fieldErrors?: Record<string, string[]> } | string } };
        if (e?.status === 400 && typeof e.data?.error === "object" && e.data.error?.fieldErrors) {
          const fe: Record<string, string> = {};
          for (const [k, msgs] of Object.entries(e.data.error.fieldErrors)) {
            fe[k] = (msgs as string[])[0];
          }
          setErrors(fe);
        }
      },
    });
  }

  function handleDeleteConfirm() {
    if (!deleteId) return;
    deleteUser.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  }

  useEffect(() => {
    if (session && session.user.role !== "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  if (!session) return null;

  return (
    <div>
      <Header title="Podešavanja" user={{ name: session.user.name, role: session.user.role }} />
      <div className="p-4 lg:p-6 max-w-4xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Osoblje
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4" /> Dodaj</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Dodaj osoblje</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ime i prezime *</Label>
                    <Input value={newUser.name} onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))} placeholder="Dr. Ime Prezime" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={newUser.email} onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} placeholder="email@dentcare.rs" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Lozinka *</Label>
                    <PasswordInput value={newUser.password} onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} placeholder="Min. 6 karaktera" />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Uloga</Label>
                    <Select value={newUser.role} onValueChange={(v) => setNewUser((u) => ({ ...u, role: v as Role }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DENTIST">Stomatolog</SelectItem>
                        <SelectItem value="ASSISTANT">Asistent</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Otkaži</Button>
                    <Button type="submit" disabled={createUser.isPending}>
                      {createUser.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Dodavanje...</> : "Dodaj"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Dodat</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}</TableRow>
                    ))
                  ) : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant={roleBadgeVariant[u.role]}>{roleLabel[u.role]}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                      <TableCell>
                        {u.id !== session.user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                            onClick={() => setDeleteId(u.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden space-y-3">
              {isPending ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
              ) : users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <Badge variant={roleBadgeVariant[u.role]} className="mt-1">{roleLabel[u.role]}</Badge>
                  </div>
                  {u.id !== session.user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(u.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {(() => {
          const dentistOptions = users.filter((u) => ["ADMIN", "DENTIST"].includes(u.role));
          if (dentistOptions.length === 0) return null;
          return (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Radno vrijeme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkingHoursEditor dentists={dentistOptions} />
              </CardContent>
            </Card>
          );
        })()}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Obriši korisnika?"
        description={`Ova akcija je nepovratna. Korisnik ${userToDelete?.name ?? ""} će biti obrisan.`}
        confirmLabel="Obriši"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
