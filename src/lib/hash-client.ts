/** SHA-256 as lowercase hex, computed locally with Web Crypto (works in browsers and Node 20+). */
export async function sha256HexOfBuffer(buf: ArrayBuffer): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
