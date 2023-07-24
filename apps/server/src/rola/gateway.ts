export type GatewayService = ReturnType<typeof GatewayService>
import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk'
import { ResultAsync } from 'neverthrow'

export const GatewayService = (basePath: string) => {
  const { state } = GatewayApiClient.initialize({
    basePath,
  })

  const getEntityDetails = (address: string) =>
    ResultAsync.fromPromise(
      state.getEntityDetailsVaultAggregated(address),
      (e: unknown) => e as Error
    )

  return {
    getEntityOwnerKeys: (address: string) =>
      getEntityDetails(address).map(
        (response) =>
          response?.metadata?.items.find((item) => item.key === 'owner_keys')
            ?.value.raw_hex ?? ''
      ),
  }
}
