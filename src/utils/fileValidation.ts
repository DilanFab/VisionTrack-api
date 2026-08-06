import fs from "fs";

// Verificar magic bytes contra una firma conocida
function matchSignature(buf: Buffer, sig: number[], offset: number): boolean {
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
}

// Verificar firmas de imagen conocidas (magic bytes)
export function isValidImage(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    if (matchSignature(buf, [0xff, 0xd8, 0xff], 0)) return true;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (matchSignature(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)) return true;
    // GIF: 47 49 46 38
    if (matchSignature(buf, [0x47, 0x49, 0x46, 0x38], 0)) return true;
    // BMP: 42 4D
    if (matchSignature(buf, [0x42, 0x4d], 0)) return true;
    // WEBP: RIFF????WEBP
    if (
      matchSignature(buf, [0x52, 0x49, 0x46, 0x46], 0) &&
      matchSignature(buf, [0x57, 0x45, 0x42, 0x50], 8)
    ) return true;

    return false;
  } catch {
    return false;
  }
}
