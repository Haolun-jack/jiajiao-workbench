import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { badRequest, ok, serverError } from "@/lib/api";

const execFileAsync = promisify(execFile);

function sanitizeName(name: string): string {
  const base = path.basename(name).replace(/[\\/:*?"<>|]/g, "_");
  return base || "file";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return badRequest("请选择要上传的文件");
    }
    if (file.size > 10 * 1024 * 1024) {
      return badRequest("文件不能超过 10MB");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeName(file.name);
    const dir = path.join(process.cwd(), "uploads");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${Date.now()}-${safeName}`);
    await writeFile(filePath, bytes);

    let text: string | null = null;
    if (/\.(txt|md)$/i.test(safeName)) {
      text = bytes.toString("utf-8");
    } else if (/\.docx$/i.test(safeName)) {
      try {
        const { stdout } = await execFileAsync(
          "officecli",
          ["view", filePath, "text", "--max-lines", "500"],
          { maxBuffer: 10 * 1024 * 1024, timeout: 20000 },
        );
        text = stdout
          .split(/\r?\n/)
          .map((line) => line.replace(/^\[[^\]]*\]\s*/, ""))
          .join("\n")
          .trim();
      } catch {
        text = null;
      }
    }

    return ok({ path: filePath, name: file.name, size: file.size, text });
  } catch (error) {
    return serverError(error);
  }
}
