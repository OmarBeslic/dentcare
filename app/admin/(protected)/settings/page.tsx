"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/admin/_components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { Role } from "@prisma/client";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import AddStaffModal from "./_components/AddStaffModal";
import { StaffTable } from "./_components/StaffTable";
import { WorkingHoursSection } from "./_components/WorkingHoursSection";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users = [], isPending } = useUsers();
  const deleteUser = useDeleteUser();

  const userToDelete = users.find((u) => u.id === deleteId);

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
      <Header
        title="Podešavanja"
        user={{ name: session.user.name, role: session.user.role as Role }}
      />
      <div className="p-4 lg:p-6 max-w-4xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Osoblje
            </CardTitle>
            <AddStaffModal open={open} setOpen={setOpen} />
          </CardHeader>
          <CardContent>
            <StaffTable
              users={users}
              isPending={isPending}
              currentUserId={session.user.id}
              onDeleteRequest={setDeleteId}
            />
          </CardContent>
        </Card>

        <WorkingHoursSection users={users} />
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
