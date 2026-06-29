import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function SuperAdminPage() {
  const clinics = await prisma.clinic.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Klinike</h2>
        <Button asChild>
          <Link href="/super-admin/clinics/new">
            <Plus className="w-4 h-4" /> Nova klinika
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Korisnici</TableHead>
                  <TableHead>Kreirana</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>
                      <Badge variant={clinic.isActive ? "success" : "destructive"}>
                        {clinic.isActive ? "Aktivna" : "Neaktivna"}
                      </Badge>
                    </TableCell>
                    <TableCell>{clinic._count.users}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(clinic.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/super-admin/clinics/${clinic.id}`}>Pregled</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="block md:hidden divide-y divide-border">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {clinic.name}
                  </p>
                  <Badge variant={clinic.isActive ? "success" : "destructive"}>
                    {clinic.isActive ? "Aktivna" : "Neaktivna"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {clinic._count.users} korisnika · {formatDate(clinic.createdAt)}
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/super-admin/clinics/${clinic.id}`}>Pregled</Link>
                </Button>
              </div>
            ))}
          </div>

          {clinics.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">
              Nema kreiranih klinika.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
