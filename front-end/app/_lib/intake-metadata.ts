"use client";

export type IntakeSpecification = {
  name: string;
  value: string;
};

export function buildIntakeMetadataNote(input: {
  note: string;
  department: string;
  category: string;
  itemType: string;
  specifications?: IntakeSpecification[];
}) {
  const baseNote = input.note.trim();
  const metadata = [
    `Department: ${input.department.trim() || "-"}`,
    `Category: ${input.category.trim() || "-"}`,
    `Type: ${input.itemType.trim() || "-"}`,
  ].join(" | ");
  const specifications = (input.specifications ?? [])
    .map((specification) => ({
      name: specification.name.trim(),
      value: specification.value.trim(),
    }))
    .filter((specification) => specification.name && specification.value);
  const specsLine =
    specifications.length > 0
      ? `\n[Specs] ${JSON.stringify(specifications)}`
      : "";

  return `${baseNote}\n[Intake] ${metadata}${specsLine}`.trim();
}

export function parseIntakeMetadata(note?: string | null) {
  const value = note?.trim() ?? "";
  const metadataLine = value
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("[Intake]"));

  if (!metadataLine) {
    return {
      department: "",
      category: "",
      itemType: "",
      specifications: [] as IntakeSpecification[],
    };
  }

  const specsLine = value
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("[Specs]"));

  let specifications: IntakeSpecification[] = [];
  if (specsLine) {
    try {
      const parsed = JSON.parse(specsLine.replace("[Specs]", "").trim()) as unknown;
      if (Array.isArray(parsed)) {
        specifications = parsed
          .filter(
            (entry): entry is { name?: string; value?: string } =>
              typeof entry === "object" && entry !== null,
          )
          .map((entry) => ({
            name: entry.name?.trim() ?? "",
            value: entry.value?.trim() ?? "",
          }))
          .filter((entry) => entry.name && entry.value);
      }
    } catch {}
  }

  const fields = metadataLine.replace("[Intake]", "").trim().split("|");
  const lookup = new Map(
    fields.map((field) => {
      const [label, ...rest] = field.split(":");
      return [label?.trim().toLowerCase() ?? "", rest.join(":").trim()];
    }),
  );

  return {
    department: lookup.get("department") ?? "",
    category: lookup.get("category") ?? "",
    itemType: lookup.get("type") ?? "",
    specifications,
  };
}
