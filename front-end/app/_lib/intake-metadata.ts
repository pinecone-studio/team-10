"use client";

export function buildIntakeMetadataNote(input: {
  note: string;
  department: string;
  category: string;
  itemType: string;
}) {
  const baseNote = input.note.trim();
  const metadata = [
    `Department: ${input.department.trim() || "-"}`,
    `Category: ${input.category.trim() || "-"}`,
    `Type: ${input.itemType.trim() || "-"}`,
  ].join(" | ");

  return `${baseNote}\n[Intake] ${metadata}`.trim();
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
    };
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
  };
}
