async function sha256(str: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  console.warn('Web Crypto API not available');
  return str;
}

async function verifyHash() {
  const password = "Kayushan204070";
  const hash = await sha256(password);
  console.log(`Password: ${password}`);
  console.log(`Generated hash: ${hash}`);
  console.log(`Expected hash:  f4186b6e0cb8888a77054e5b293787d0cfa25ae8aa0ad287dda0624ba0da82d8`);
  console.log(`Hashes match: ${hash === "f4186b6e0cb8888a77054e5b293787d0cfa25ae8aa0ad287dda0624ba0da82d8"}`);
}

// Run in browser console
verifyHash();
