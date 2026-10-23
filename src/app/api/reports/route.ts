import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { db, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getNeighbourhoods } from "@/data/neighbourhoods";
import { detectImageType, MAX_FILE_BYTES, validateReport } from "@/lib/reports";
import { findDuplicates, type Candidate } from "@/lib/duplicates";
import { checkRate, tooMany } from "@/lib/ratelimit";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

// Uploads to the private "evidence" bucket, creating it first if supabase/phase4.sql was not run.
async function uploadEvidence(path: string, buf: Uint8Array, type: string): Promise<boolean> {
  const put = () => db().storage.from("evidence").upload(path, buf, { contentType: type });
  let up = await put();
  if (up.error && /bucket not found/i.test(up.error.message)) {
    const mk = await db().storage.createBucket("evidence", {
      public: false,
      fileSizeLimit: MAX_FILE_BYTES,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (mk.error) console.error("Could not create evidence bucket:", mk.error.message);
    else up = await put();
  }
  if (up.error) console.error("Evidence upload failed:", up.error.message);
  return !up.error;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("Please log in first.", 401);
  const rate = await checkRate(req, "report", 10, 3600);
  if (!rate.ok) return tooMany(rate.retryAfter);

  const form = await req.formData();
  const hoods = await getNeighbourhoods();
  const v = validateReport(
    { category: form.get("category"), description: form.get("description"), neighbourhoodId: form.get("neighbourhoodId") },
    hoods.items.map((h) => h.id),
  );
  if (!v.ok) return fail(v.error, 400);
  if (!isDbConfigured()) return fail("The database is not configured, so reports cannot be saved.", 503);

  let hash: string | null = null;
  let path: string | null = null;
  const file = form.get("evidence");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return fail("The photo is larger than 4 MB.", 413);
    const buf = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(buf);
    if (!type) return fail("Only JPEG, PNG or WebP photos are accepted.", 400);
    hash = createHash("sha256").update(buf).digest("hex");
    path = `${randomUUID()}.${EXT[type]}`;
    if (!(await uploadEvidence(path, buf, type))) return fail("Could not store the photo. Please try again.", 502);
  }

  const { neighbourhoodId, category, description } = v.value;
  const or = `neighbourhood_id.eq.${neighbourhoodId}` + (hash ? `,evidence_sha256.eq.${hash}` : "");
  const { data: cands } = await db()
    .from("reports")
    .select("public_id,description,category,neighbourhood_id,evidence_sha256,created_at")
    .or(or).order("created_at", { ascending: false }).limit(200);
  const flags = findDuplicates({ description, category, neighbourhoodId, hash }, (cands ?? []) as Candidate[]);

  const base = { neighbourhood_id: neighbourhoodId, category, description, evidence_path: path, evidence_sha256: hash, author_name: session.name, duplicate_flags: flags };
  let { data: row, error } = await db().from("reports").insert({ ...base, author_session: session.sid }).select("id,public_id").single();
  if (error && /author_session/i.test(error.message)) {
    // supabase/phase11.sql has not been run yet: save without the owner id rather than lose the report.
    console.error("Column author_session is missing; run supabase/phase11.sql");
    ({ data: row, error } = await db().from("reports").insert(base).select("id,public_id").single());
  }
  if (error || !row) {
    if (path) await db().storage.from("evidence").remove([path]);
    return fail("Could not save the report. Please try again.", 500);
  }
  await db().from("audit_events").insert({ report_id: row.id, actor_role: session.role, action: "submitted" });
  return NextResponse.json({ publicId: row.public_id, duplicateFlags: flags.length }, { status: 201 });
}
