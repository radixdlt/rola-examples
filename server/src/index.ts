import express from 'express'
import { secureRandom } from './rola/crypto/secure-random'
import { SignedChallenge } from '@radixdlt/radix-dapp-toolkit'
import { RolaFactory } from './rola/rola'
import cors from 'cors'
import { GatewayService } from './rola/gateway'

const app = express()
app.use(cors())
app.use(express.json())

const port = 3000

// A simple in-memory store for challenges. A database should be used in production.
const ChallengeStore = () => {
  const challenges = new Map<string, { expires: number }>()

  const create = () => {
    const challenge = secureRandom(32) // 32 random bytes as hex string
    const expires = Date.now() + 1000 * 60 * 5 // expires in 5 minutes
    challenges.set(challenge, { expires }) // store challenge with expiration

    return challenge
  }

  const verify = (input: string) => {
    const challenge = challenges.get(input)

    if (!challenge) return false

    challenges.delete(input) // remove challenge after it has been used
    const isValid = challenge.expires > Date.now() // check if challenge has expired

    return isValid
  }

  return { create, verify }
}

const challengeStore = ChallengeStore()

const rola = RolaFactory({
  gatewayService: GatewayService('https://enkinet-gateway.radixdlt.com'), // gateway service to query the ledger
  dAppDefinitionAddress:
    'account_tdx_21_129e0ffephdq9mtd26rn5m99pq3jwwscggwa8wxnu6pz78lutsw8j7v', // address of the dApp definition
  networkId: 33, // network id of the Radix network
  expectedOrigin: 'http://localhost:4000', // origin of the client making the wallet request
})

app.get('/create-challenge', (req, res) => {
  res.send({ challenge: challengeStore.create() })
})

app.post<{}, { valid: boolean }, SignedChallenge>(
  '/verify',
  async (req, res) => {
    const isChallengeValid = challengeStore.verify(req.body.challenge)

    if (!isChallengeValid) return res.send({ valid: false })

    const result = await rola(req.body)

    if (result.isErr()) return res.send({ valid: false })

    // The signature is valid and the public key is owned by the user
    res.send({ valid: true })
  }
)

app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`)
})
