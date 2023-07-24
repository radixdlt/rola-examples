import { Buffer } from 'buffer'
import type { Result } from 'neverthrow'
import { blake2b } from '../crypto/blake2b'

export const createSignatureMessage = ({
  challenge,
  dAppDefinitionAddress,
  origin,
}: {
  challenge: string
  dAppDefinitionAddress: string
  origin: string
}): Result<string, { reason: string; jsError: Error }> => {
  const prefix = Buffer.from('R', 'ascii')
  const lengthOfDappDefAddress = dAppDefinitionAddress.length
  const lengthOfDappDefAddressBuffer = Buffer.from(
    lengthOfDappDefAddress.toString(16),
    'hex'
  )
  const dappDefAddressBuffer = Buffer.from(dAppDefinitionAddress, 'utf-8')
  const originBuffer = Buffer.from(origin, 'utf-8')
  const challengeBuffer = Buffer.from(challenge, 'hex')

  const messageBuffer = Buffer.concat([
    prefix,
    challengeBuffer,
    lengthOfDappDefAddressBuffer,
    dappDefAddressBuffer,
    originBuffer,
  ])

  return blake2b(messageBuffer)
    .map((hash) => Buffer.from(hash).toString('hex'))
    .mapErr((jsError) => ({ reason: 'couldNotHashMessage', jsError }))
}
