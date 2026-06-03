export const queryKeys = {
  appointments: {
    all: ["appointments"] as const,
    list: (filters: object) => ["appointments", "list", filters] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
    availability: (params: object) => ["appointments", "availability", params] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (search: string) => ["patients", "list", search] as const,
    detail: (id: string) => ["patients", "detail", id] as const,
    records: (patientId: string) => ["patients", "records", patientId] as const,
    record: (patientId: string, recordId: string) =>
      ["patients", "records", patientId, recordId] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
  },
};
