import fs from "node:fs";

const source = fs.readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const pattern = /\{ id: (\d+), name: "([^"]+)", segment: "([^"]+)", city: "([^"]+)", state: "([^"]+)", phone: "([^"]+)" \}/g;
const leads = [];
for (const match of source.matchAll(pattern)) {
  const [, id, name, segment, city, state, phone] = match;
  leads.push({ id: Number(id), name, segment, city, state, phone: phone === "Não informado" ? null : phone });
}
if (leads.length === 0) throw new Error("No leads found in Home.tsx");
const serialized = leads.map(lead => `  ${JSON.stringify(lead)},`).join("\n");
const output = `export type SeedLead = { id: number; name: string; segment: string; city: string; state: string; phone: string | null };\n\nexport const seedLeads: SeedLead[] = [\n${serialized}\n];\n`;
fs.mkdirSync(new URL("../server", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../server/seedLeads.ts", import.meta.url), output);
console.log(`Extracted ${leads.length} leads`);
