export const authEnvContract = {
  issuer: "SPACETIMEDB_AUTH_ISSUER",
  audience: "SPACETIMEDB_AUTH_AUDIENCE",
  adminEmails: "ENAKKO_ADMIN_EMAILS",
} as const;

export interface AdminClaimConfig {
  issuer: string;
  audience: string;
  adminEmails: readonly string[];
}

export interface ReducerClaims {
  issuer?: string | null;
  audience?: string | readonly string[] | null;
  email?: string | null;
  subject?: string | null;
  roles?: readonly string[] | null;
  isAdmin?: boolean | null;
}

export interface ReducerAuthContext {
  config: AdminClaimConfig;
  claims: ReducerClaims | null;
}

export interface AdminClaimPrincipal {
  email: string | null;
  subject: string | null;
}

function requireConfigValue(value: string, envVarName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`Reducer auth config '${envVarName}' must be set.`);
  }

  return normalized;
}

function normalizeStringList(values: readonly string[] | null | undefined): string[] {
  return (values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function normalizeAudience(audience: ReducerClaims["audience"]): string[] {
  if (typeof audience === "string") {
    return [audience.trim()].filter(Boolean);
  }

  return (audience ?? []).map((value) => value.trim()).filter(Boolean);
}

function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resolveAdminAuthorization(config: AdminClaimConfig, claims: ReducerClaims): boolean {
  const email = claims.email ? normalizeAdminEmail(claims.email) : null;
  const roles = normalizeStringList(claims.roles);

  return (
    claims.isAdmin === true ||
    roles.includes("admin") ||
    (email !== null && config.adminEmails.includes(email))
  );
}

export function assertAdminClaims(context: ReducerAuthContext): AdminClaimPrincipal {
  const issuer = requireConfigValue(context.config.issuer, authEnvContract.issuer);
  const audience = requireConfigValue(context.config.audience, authEnvContract.audience);
  const adminEmails = context.config.adminEmails.map(normalizeAdminEmail).filter(Boolean);

  if (adminEmails.length === 0) {
    throw new Error(
      `Reducer auth config '${authEnvContract.adminEmails}' must list at least one admin email.`,
    );
  }

  if (!context.claims) {
    throw new Error("Reducer writes require authenticated admin claims.");
  }

  if (context.claims.issuer !== issuer) {
    throw new Error(`Reducer claim issuer '${context.claims.issuer ?? "unknown"}' is not allowed.`);
  }

  const audiences = normalizeAudience(context.claims.audience);

  if (!audiences.includes(audience)) {
    throw new Error(`Reducer claim audience must include '${audience}'.`);
  }

  if (!resolveAdminAuthorization({ issuer, audience, adminEmails }, context.claims)) {
    throw new Error("Reducer writes require an authorized admin identity.");
  }

  return {
    email: context.claims.email ? normalizeAdminEmail(context.claims.email) : null,
    subject: context.claims.subject?.trim() ?? null,
  };
}

export default assertAdminClaims;
