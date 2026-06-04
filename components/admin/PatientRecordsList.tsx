import Link from "next/link";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

interface Record {
  id: string;
  visitDate: Date;
  diagnosis: string | null;
  createdBy: { name: string };
}

interface Props {
  records: Record[];
  patientId: string;
}

export function PatientRecordsList({ records, patientId }: Props) {
  if (records.length === 0) {
    return <EmptyState icon={FileText} message="Nema kartona." />;
  }

  return (
    <div className="space-y-3">
      {records.map((r) => (
        <Link key={r.id} href={`/admin/patients/${patientId}/records/${r.id}/edit`}>
          <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <p className="text-sm font-medium">{formatDate(r.visitDate)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {r.diagnosis ?? "Bez dijagnoze"}
            </p>
            <p className="text-xs text-muted-foreground">Dr. {r.createdBy.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
