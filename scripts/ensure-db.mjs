import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolve(root, "prisma");
const dbPath = resolve(dir, "dev.db");

mkdirSync(dir, { recursive: true });

if (!existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  db.close();
  console.log("已创建空数据库文件 dev.db");
} else {
  console.log("dev.db 已存在，跳过创建");
}
