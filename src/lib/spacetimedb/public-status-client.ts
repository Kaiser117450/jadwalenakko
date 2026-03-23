import {
  DbConnection,
  type SubscriptionHandle,
} from "./module_bindings";
import type {
  PublicCurrentStatusRow,
  StatusKind as RuntimeStatusKind,
} from "./module_bindings/types";
import type { PublicCurrentStatusPayload, StatusKind } from "../../../../spacetimedb/src/publicReadModel";

export const PUBLIC_STATUS_QUERY_NAME = "publicCurrentStatus";

const DEFAULT_SPACETIMEDB_URI =
  import.meta.env.PUBLIC_SPACETIMEDB_URI ?? "wss://maincloud.spacetimedb.com";
const DEFAULT_SPACETIMEDB_DATABASE =
  import.meta.env.PUBLIC_SPACETIMEDB_DATABASE ??
  "c2005fe19a7ffd63d4d7f94d3971b38bce7c4ae5fd50810f3ab5831e42ba22ad";
const PUBLIC_STATUS_QUERY_SQL = `SELECT * FROM ${PUBLIC_STATUS_QUERY_NAME}`;

export interface PublicStatusClientOptions {
  uri?: string;
  databaseName?: string;
  token?: string;
}

export type PublicStatusListener = (payload: PublicCurrentStatusPayload | null) => void;

let activeConnection: DbConnection | null = null;
let activeSubscription: SubscriptionHandle | null = null;
let activeConfigKey: string | null = null;
let cacheListenersAttached = false;
const listeners = new Set<PublicStatusListener>();

function normalizeStatusKind(statusKind: RuntimeStatusKind): StatusKind {
  switch (statusKind.tag.toLowerCase()) {
    case "normal":
      return "normal";
    case "limited":
      return "limited";
    case "halfday":
      return "halfday";
    case "closed":
      return "closed";
    default:
      return "normal";
  }
}

function toPublicCurrentStatusPayload(row: PublicCurrentStatusRow): PublicCurrentStatusPayload {
  return {
    announcementId: row.announcementId,
    statusKind: normalizeStatusKind(row.statusKind),
    title: row.title,
    message: row.message,
    bannerText: row.bannerText,
    startsAt: row.startsAt ?? null,
    endsAt: row.endsAt ?? null,
    isFallbackNormal: row.isFallbackNormal,
    openBranchCount: row.openBranchCount,
    closedBranchCount: row.closedBranchCount,
    branches: row.branches.map((branch) => ({
      branchId: branch.branchId,
      slug: branch.slug,
      name: branch.name,
      statusKind: normalizeStatusKind(branch.statusKind),
      isOpen: branch.isOpen,
      isTargeted: branch.isTargeted,
    })),
  };
}

function readPublicCurrentStatus(connection: DbConnection | null = activeConnection) {
  if (!connection) {
    return null;
  }

  const row = Array.from(connection.db.publicCurrentStatus.iter())[0];
  return row ? toPublicCurrentStatusPayload(row) : null;
}

function notifyListeners(payload: PublicCurrentStatusPayload | null) {
  listeners.forEach((listener) => {
    listener(payload);
  });
}

function emitCurrentStatus(connection: DbConnection | null = activeConnection) {
  notifyListeners(readPublicCurrentStatus(connection));
}

function attachCacheListeners(connection: DbConnection) {
  if (cacheListenersAttached) {
    return;
  }

  connection.db.publicCurrentStatus.onInsert(() => {
    emitCurrentStatus(connection);
  });
  connection.db.publicCurrentStatus.onUpdate(() => {
    emitCurrentStatus(connection);
  });
  connection.db.publicCurrentStatus.onDelete(() => {
    emitCurrentStatus(connection);
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
      emitCurrentStatus(connection);
    })
    .onError(() => {
      notifyListeners(null);
    })
    .subscribe([PUBLIC_STATUS_QUERY_SQL]);
}

export function createPublicStatusClient(
  options: PublicStatusClientOptions = {},
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
    disconnectPublicStatusClient(activeConnection);
  }

  activeConfigKey = configKey;

  let builder = DbConnection.builder()
    .withUri(uri)
    .withDatabaseName(databaseName)
    .onConnect((connection) => {
      ensureSubscription(connection);
      emitCurrentStatus(connection);
    })
    .onDisconnect(() => {
      activeSubscription = null;
      notifyListeners(null);
    })
    .onConnectError(() => {
      activeSubscription = null;
      notifyListeners(null);
    });

  if (options.token) {
    builder = builder.withToken(options.token);
  }

  activeConnection = builder.build();
  return activeConnection;
}

export function subscribePublicCurrentStatus(
  listener: PublicStatusListener,
  options: PublicStatusClientOptions = {},
) {
  listeners.add(listener);
  const connection = createPublicStatusClient(options);

  if (connection.isActive) {
    ensureSubscription(connection);
    listener(readPublicCurrentStatus(connection));
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && activeSubscription && !activeSubscription.isEnded()) {
      activeSubscription.unsubscribe();
      activeSubscription = null;
    }
  };
}

export function disconnectPublicStatusClient(connection: DbConnection | null = activeConnection) {
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
