import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { ClinicDetailClient } from "./ClinicDetailClient";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  DENTIST: "Stomatolog",
  ASSISTANT: "Asistent",
};

export default async function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!clinic) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ClinicDetailClient clinic={clinic} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Osoblje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Uloga</TableHead>
                  <TableHead>Dodat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinic.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="teal">{roleLabel[u.role] ?? u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="block md:hidden space-y-3">
            {clinic.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="teal">{roleLabel[u.role] ?? u.role}</Badge>
              </div>
            ))}
          </div>

          {clinic.users.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nema osoblja u ovoj klinici.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
