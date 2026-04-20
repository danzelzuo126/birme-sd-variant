(function (global) {
  const textEncoder = new TextEncoder();

  function crc32(buf) {
    let table = crc32.table;
    if (!table) {
      table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
      }
      crc32.table = table;
    }

    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function pushUint16(arr, n) {
    arr.push(n & 0xff, (n >>> 8) & 0xff);
  }

  function pushUint32(arr, n) {
    arr.push(n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff);
  }

  class JSZipLite {
    constructor() {
      this.entries = [];
    }

    file(name, blob) {
      this.entries.push({ name, blob });
      return this;
    }

    async generateAsync(options) {
      if (!options || options.type !== "blob") {
        throw new Error("jszip-lite only supports generateAsync({ type: 'blob' })");
      }

      const localParts = [];
      const centralParts = [];
      let offset = 0;

      for (const entry of this.entries) {
        const fileNameBytes = textEncoder.encode(entry.name);
        const fileBytes = new Uint8Array(await entry.blob.arrayBuffer());
        const crc = crc32(fileBytes);
        const compressedSize = fileBytes.length;
        const uncompressedSize = fileBytes.length;

        const localHeader = [];
        pushUint32(localHeader, 0x04034b50);
        pushUint16(localHeader, 20);
        pushUint16(localHeader, 0);
        pushUint16(localHeader, 0);
        pushUint16(localHeader, 0);
        pushUint16(localHeader, 0);
        pushUint32(localHeader, crc);
        pushUint32(localHeader, compressedSize);
        pushUint32(localHeader, uncompressedSize);
        pushUint16(localHeader, fileNameBytes.length);
        pushUint16(localHeader, 0);

        localParts.push(new Uint8Array(localHeader));
        localParts.push(fileNameBytes);
        localParts.push(fileBytes);

        const centralHeader = [];
        pushUint32(centralHeader, 0x02014b50);
        pushUint16(centralHeader, 20);
        pushUint16(centralHeader, 20);
        pushUint16(centralHeader, 0);
        pushUint16(centralHeader, 0);
        pushUint16(centralHeader, 0);
        pushUint16(centralHeader, 0);
        pushUint32(centralHeader, crc);
        pushUint32(centralHeader, compressedSize);
        pushUint32(centralHeader, uncompressedSize);
        pushUint16(centralHeader, fileNameBytes.length);
        pushUint16(centralHeader, 0);
        pushUint16(centralHeader, 0);
        pushUint16(centralHeader, 0);
        pushUint16(centralHeader, 0);
        pushUint32(centralHeader, 0);
        pushUint32(centralHeader, offset);

        centralParts.push(new Uint8Array(centralHeader));
        centralParts.push(fileNameBytes);

        offset += localHeader.length + fileNameBytes.length + fileBytes.length;
      }

      const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
      const end = [];
      pushUint32(end, 0x06054b50);
      pushUint16(end, 0);
      pushUint16(end, 0);
      pushUint16(end, this.entries.length);
      pushUint16(end, this.entries.length);
      pushUint32(end, centralSize);
      pushUint32(end, offset);
      pushUint16(end, 0);

      return new Blob([...localParts, ...centralParts, new Uint8Array(end)], { type: "application/zip" });
    }
  }

  global.JSZip = JSZipLite;
})(window);
