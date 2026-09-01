import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLogs, authIdentities, concentrationRules, portfolios, users, workspaceMembers, workspaces } from "@/db/schema";

export type UserContext = { userId: number; workspaceId: number; email: string; displayName: string; role: string };

function identity(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const name = encodedName ? decodeURIComponent(encodedName) : null;
  if (email) return { provider: "CHATGPT_SITES", subject: email, email, name: name || email.split("@")[0] };
  if (process.env.NODE_ENV !== "production") return { provider: "LOCAL_DEVELOPMENT", subject: "local-owner", email: "guilherme@evidaris.local", name: "Guilherme" };
  return null;
}

export async function requireUserContext(request: Request): Promise<UserContext> {
  const source = identity(request);
  if (!source) throw new Response("Não autenticado", { status: 401 });
  const db = getDb();
  let user = (await db.select().from(users).where(eq(users.email, source.email)).limit(1))[0];
  if (!user) {
    [user] = await db.insert(users).values({ email: source.email, displayName: source.name, lastLoginAt: new Date().toISOString() }).returning();
    await db.insert(authIdentities).values({ userId: user.id, provider: source.provider, providerSubject: source.subject, emailVerifiedAt: new Date().toISOString() });
  }
  let member = (await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.userId, user.id), eq(workspaceMembers.status, "ACTIVE"))).limit(1))[0];
  if (!member) {
    const anyMember = (await db.select().from(workspaceMembers).limit(1))[0];
    let workspaceId: number;
    if (!anyMember) {
      const existing = (await db.select().from(workspaces).limit(1))[0];
      workspaceId = existing?.id ?? (await db.insert(workspaces).values({ name: `Patrimônio de ${source.name}` }).returning())[0].id;
    } else workspaceId = (await db.insert(workspaces).values({ name: `Patrimônio de ${source.name}` }).returning())[0].id;
    [member] = await db.insert(workspaceMembers).values({ workspaceId, userId: user.id, role: "WORKSPACE_OWNER" }).returning();
    await db.insert(portfolios).values({ workspaceId, name: "Carteira principal" });
    await db.insert(concentrationRules).values([
      { workspaceId, dimension: "ASSET", thresholdPercent: 20 }, { workspaceId, dimension: "ASSET_CLASS", thresholdPercent: 40 },
      { workspaceId, dimension: "INSTITUTION", thresholdPercent: 50 }, { workspaceId, dimension: "CURRENCY", thresholdPercent: 70 },
      { workspaceId, dimension: "ISSUER", thresholdPercent: 25 },
    ]).onConflictDoNothing();
  }
  await db.update(users).set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
  return { userId: user.id, workspaceId: member.workspaceId, email: user.email, displayName: user.displayName, role: member.role };
}

export async function audit(context: UserContext, action: string, entityType: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  await getDb().insert(auditLogs).values({ workspaceId: context.workspaceId, userId: context.userId, action, entityType, entityId, metadataJson: JSON.stringify(metadata) });
}
