import {
  DbConnection,
  type SubscriptionHandle,
} from "./module_bindings";
import type { StatusKind as AppStatusKind } from "../../../spacetimedb/src/schema";
import type { BranchRow, StatusKind as RuntimeStatusKind } from "./module_bindings/types";
import type {
  CreateBranchParams,
  DeactivateBranchParams,
  SetAnnouncementBranchTargetsParams,
  UpdateBranchParams,
  UpsertAnnouncementParams,
} from "./module_bindings/types/reducers";

export const ADMIN_BRANCH_DIRECTORY_QUERY_NAME = "adminBranchDirectory";

const DEFAULT_SPACETIMEDB_URI =
  import.meta.env.PUBLIC_SPACETIMEDB_URI ?? "wss://maincloud.spacetimedb.com";
const DEFAULT_SPACETIMEDB_DATABASE =
  import.meta.env.PUBLIC_SPACETIMEDB_DATABASE ??
  "c2005fe19a7ffd63d4d7f94d3971b38bce7c4ae5fd50810f3ab5831e42ba22ad";
const ADMIN_BRANCH_DIRECTORY_QUERY_SQL = `SELECT * FROM ${ADMIN_BRANCH_DIRECTORY_QUERY_NAME}`;

export interface AdminBranchClientOptions {
  uri?: string;
  databaseName?: string;
  token?: string;
}

export type AdminBranchDirectoryListener = (branches: BranchRow[]) => void;

let activeConnection: DbConnection | null = null;
let activeSubscription: SubscriptionHandle | null = null;
let activeConfigKey: string | null = null;
let cacheListenersAttached = false;
const listeners = new Set<AdminBranchDirectoryListener>();

function sortBranchRows(branches: BranchRow[]): BranchRow[] {
  return [...branches].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
}

function toRuntimeStatusKind(statusKind: AppStatusKind | RuntimeStatusKind): RuntimeStatusKind {
  if (typeof statusKind === "object" && statusKind !== null && "tag" in statusKind) {
    return statusKind;
  }

  switch (statusKind) {
    case "normal":
      return { tag: "Normal" };
    case "limited":
      return { tag: "Limited" };
    case "halfday":
      return { tag: "Halfday" };
    case "closed":
      return { tag: "Closed" };
    default:
      return { tag: "Normal" };
  }
}

function readAdminBranchDirectory(connection: DbConnection | null = activeConnection): BranchRow[] {
  if (!connection) {
    return [];
  }

  return sortBranchRows(Array.from(connection.db.adminBranchDirectory.iter()).map((branch) => ({
    branchId: branch.branchId,
    slug: branch.slug,
    name: branch.name,
    isActive: branch.isActive,
    sortOrder: branch.sortOrder,
  })));
}

function notifyListeners(branches: BranchRow[]) {
  listeners.forEach((listener) => {
    listener(branches);
  });
}

function emitAdminBranchDirectory(connection: DbConnection | null = activeConnection) {
  notifyListeners(readAdminBranchDirectory(connection));
}

function attachCacheListeners(connection: DbConnection) {
  if (cacheListenersAttached) {
    return;
  }

  connection.db.adminBranchDirectory.onInsert(() => {
    emitAdminBranchDirectory(connection);
  });
  connection.db.adminBranchDirectory.onUpdate(() => {
    emitAdminBranchDirectory(connection);
  });
  connection.db.adminBranchDirectory.onDelete(() => {
    emitAdminBranchDirectory(connection);
  });

  cacheListenersAttached = true;
}

function ensureSubscription(connection: DbConnection) {
  if (activeSubscription && !activeSubscription.isEnded()) {
    return;
  }

  attachCacheListeners(connection);
  activeSubscription = connection
    .subscriptionBuilder()
    .onApplied(() => {
      emitAdminBranchDirectory(connection);
    })
    .onError(() => {
      notifyListeners([]);
    })
    .subscribe([ADMIN_BRANCH_DIRECTORY_QUERY_SQL]);
}

export function createAdminBranchClient(
  options: AdminBranchClientOptions = {},
): DbConnection {
  const uri = options.uri ?? DEFAULT_SPACETIMEDB_URI;
  const databaseName = options.databaseName ?? DEFAULT_SPACETIMEDB_DATABASE;
  const configKey = JSON.stringify({
    uri,
    databaseName,
    token: options.token ?? "",
  });

  if (activeConnection && activeConfigKey === configKey) {
    return activeConnection;
  }

  if (activeConnection) {
    disconnectAdminBranchClient(activeConnection);
  }

  activeConfigKey = configKey;

  let builder = DbConnection.builder()
    .withUri(uri)
    .withDatabaseName(databaseName)
    .onConnect((connection) => {
      ensureSubscription(connection);
      emitAdminBranchDirectory(connection);
    })
    .onDisconnect(() => {
      activeSubscription = null;
      notifyListeners([]);
    })
    .onConnectError(() => {
      activeSubscription = null;
      notifyListeners([]);
    });

  if (options.token) {
    builder = builder.withToken(options.token);
  }

  activeConnection = builder.build();
  return activeConnection;
}

export function subscribeAdminBranchDirectory(
  listener: AdminBranchDirectoryListener,
  options: AdminBranchClientOptions = {},
) {
  listeners.add(listener);
  const connection = createAdminBranchClient(options);

  if (connection.isActive) {
    ensureSubscription(connection);
    listener(readAdminBranchDirectory(connection));
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && activeSubscription && !activeSubscription.isEnded()) {
      activeSubscription.unsubscribe();
      activeSubscription = null;
    }
  };
}

export function createBranchRecord(
  input: CreateBranchParams,
  options: AdminBranchClientOptions = {},
) {
  return createAdminBranchClient(options).reducers.createBranch(input);
}

export function updateBranchRecord(
  input: UpdateBranchParams,
  options: AdminBranchClientOptions = {},
) {
  return createAdminBranchClient(options).reducers.updateBranch(input);
}

export function deactivateBranchRecord(
  input: DeactivateBranchParams,
  options: AdminBranchClientOptions = {},
) {
  return createAdminBranchClient(options).reducers.deactivateBranch(input);
}

export function upsertAnnouncementRecord(
  input: Omit<UpsertAnnouncementParams, "statusKind"> & {
    statusKind: AppStatusKind | RuntimeStatusKind;
  },
  options: AdminBranchClientOptions = {},
) {
  return createAdminBranchClient(options).reducers.upsertAnnouncement({
    ...input,
    statusKind: toRuntimeStatusKind(input.statusKind),
  });
}

export function setAnnouncementTargetBranches(
  input: SetAnnouncementBranchTargetsParams,
  options: AdminBranchClientOptions = {},
) {
  return createAdminBranchClient(options).reducers.setAnnouncementBranchTargets(input);
}

export function disconnectAdminBranchClient(connection: DbConnection | null = activeConnection) {
  if (!connection) {
    return;
  }

  if (activeSubscription && !activeSubscription.isEnded()) {
    activeSubscription.unsubscribe();
    activeSubscription = null;
  }

  if (connection.isActive) {
    connection.disconnect();
  }

  if (connection === activeConnection) {
    activeConnection = null;
    activeConfigKey = null;
    cacheListenersAttached = false;
  }
}
