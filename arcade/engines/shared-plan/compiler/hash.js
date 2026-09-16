/* Engine One — content hashing.

   This is an identity hash, not a security boundary. It answers "is this the
   same content I compiled?" so a stored Session is never restored against
   changed content, and so a Game Revision has a stable name.

   It is deliberately synchronous and dependency-free: the compiler has to run
   the same way in CI, on a server and in the workbench, and Web Crypto's digest
   is async, which would make compilation — and therefore enumeration and the
   tests that call it — async for no benefit. */

const OFFSET_A = 0xcbf29ce484222325n;
const OFFSET_B = 0x9ae16a3b2f90404fn;
const PRIME = 0x100000001b3n;
const MASK = 0xffffffffffffffffn;

function fnv1a(bytes, offset) {
    let hash = offset;
    for (const byte of bytes) {
        hash ^= BigInt(byte);
        hash = (hash * PRIME) & MASK;
    }
    return hash;
}

/* Key order must not change the hash, so objects are serialised with sorted
   keys all the way down. */
export function canonicalJson(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

export function contentHash(value) {
    const bytes = new TextEncoder().encode(canonicalJson(value));
    const a = fnv1a(bytes, OFFSET_A);
    const b = fnv1a(bytes, OFFSET_B);
    return `${a.toString(16).padStart(16, '0')}${b.toString(16).padStart(16, '0')}`;
}
