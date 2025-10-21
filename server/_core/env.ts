function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.MYSQLHOST || process.env.MYSQL_HOST;
  const port = process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306";
  const user = process.env.MYSQLUSER || process.env.MYSQL_USER;
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQLDATABASE || process.env.MYSQL_DB || process.env.MYSQL_DATABASE;

  if (host && user && database) {
    const enc = encodeURIComponent;
    const auth = password ? `${enc(user)}:${enc(password)}` : enc(user);
    return `mysql://${auth}@${host}:${port}/${database}`;
  }
  return "";
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: buildDatabaseUrl(),
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
