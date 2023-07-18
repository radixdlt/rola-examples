import { Result, err, ok } from 'neverthrow'
import { curve25519 } from '../crypto/curve25519'
import { secp256k1 } from '../crypto/secp256k1'
import { SignedChallenge } from '@radixdlt/radix-dapp-toolkit'

const supportedCurves = new Set(['curve25519', 'secp256k1'])

export const verifyProofFactory =
  (input: SignedChallenge) =>
  (
    signatureMessageHex: string
  ): Result<undefined, { reason: string; jsError?: Error }> => {
    const isSupportedCurve = supportedCurves.has(input.proof.curve)
    if (!isSupportedCurve) return err({ reason: 'unsupportedCurve' })

    try {
      const publicKey =
        input.proof.curve === 'curve25519'
          ? // @ts-ignore: incorrect type definition in EC lib
            curve25519.keyFromPublic(input.proof.publicKey, 'hex')
          : secp256k1.keyFromPublic(input.proof.publicKey, 'hex')

      const isValid = publicKey.verify(
        signatureMessageHex,
        input.proof.signature
      )
      return isValid ? ok(undefined) : err({ reason: 'invalidSignature' })
    } catch (error: any) {
      return err({ reason: 'invalidPublicKey', jsError: error })
    }
  }
