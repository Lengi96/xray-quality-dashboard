import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

function getKey(): Buffer {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.ENCRYPTION_KEY ||
    'dev-fallback-key-32-chars-exactly'
  return createHash('sha256').update(secret).digest()
}

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(encryptedText: string): string {
  const [ivHex, dataHex] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', getKey(), iv)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString('utf8')
}

export function encryptIfPresent(text: string | null | undefined): string | null {
  if (!text) return null
  return encrypt(text)
}

export function decryptIfPresent(text: string | null | undefined): string | null {
  if (!text) return null
  try {
    return decrypt(text)
  } catch {
    return null
  }
}
