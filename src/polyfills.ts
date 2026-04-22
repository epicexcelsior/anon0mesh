import 'react-native-get-random-values';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

function installRandomValuesFallback() {
  if (typeof global.crypto === 'undefined') {
    (global as typeof globalThis & { crypto: Crypto }).crypto = {} as Crypto;
  }

  if (typeof global.crypto.getRandomValues === 'function') {
    return;
  }

  let getRandomBytes: ((byteCount: number) => Uint8Array) | null = null;

  try {
    const expoCrypto = eval('require')('expo-crypto') as {
      getRandomBytes?: (byteCount: number) => Uint8Array;
    };
    getRandomBytes = expoCrypto.getRandomBytes ?? null;
  } catch {
    getRandomBytes = null;
  }

  if (!getRandomBytes) {
    throw new Error('Secure random source unavailable');
  }

  global.crypto.getRandomValues = <T extends ArrayBufferView | null>(typedArray: T): T => {
    if (!typedArray) {
      return typedArray;
    }

    const bytes = getRandomBytes(typedArray.byteLength);
    new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength).set(bytes);
    return typedArray;
  };
}

function installRandomUuidFallback() {
  if (typeof global.crypto.randomUUID === 'function') {
    return;
  }

  global.crypto.randomUUID = () => {
    const bytes = global.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
}

installRandomValuesFallback();
installRandomUuidFallback();

export {};
