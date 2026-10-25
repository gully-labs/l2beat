// DRAFT: Gully Chain mainnet is not live yet (the testnet, chain id 485590, settles to Arbitrum Sepolia, which
// L2BEAT does not track). This file is not imported from processing/layer3s.ts on purpose. Before it can be:
//   1. deploy mainnet (settles to Arbitrum One), fill in the TODOs below with the mainnet values,
//   2. add the chain to packages/discovery/src/config/chains.ts and run `l2b discover gullychain` from
//      packages/config so that discovered.json exists (Bridge, RollupProxy, SequencerInbox, Outbox, gateways),
//   3. import it in processing/layer3s.ts (alphabetical order) and run pnpm lint:fix, format:fix, test.
// Everything in here follows the other rollup-mode Orbit L3s on Arbitrum (deri, onyx; AnyTrust ones: rari, xai).
import { ChainSpecificAddress, EthereumAddress, UnixTime } from '@l2beat/shared-pure'
import { REASON_FOR_BEING_OTHER } from '../../common'
import { BADGES } from '../../common/badges'
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'
import type { ScalingProject } from '../../internalTypes'
import { orbitStackL3 } from '../../templates/orbitStack'

const discovery = new ProjectDiscovery('gullychain')

export const gullychain: ScalingProject = orbitStackL3({
  addedAt: UnixTime(0), // TODO: the time of the listing PR
  hostChain: 'arbitrum',
  discovery,
  additionalBadges: [BADGES.L3ParentChain.Arbitrum], // self-hosted: no RaaS badge
  additionalPurposes: ['Launchpad', 'Payments'],
  // the validator set is a whitelist (validatorWhitelistDisabled = false), so proofs are closed; drop this once the
  // whitelist is disabled or BoLD permissionless validation is enabled
  reasonsForBeingOther: [REASON_FOR_BEING_OTHER.CLOSED_PROOFS],
  isNodeAvailable: true,
  nodeSourceLink: 'https://github.com/OffchainLabs/nitro',
  display: {
    name: 'Gully Chain',
    slug: 'gullychain',
    description:
      'Gully Chain is an Arbitrum Orbit L3 on Arbitrum One built by Gully Labs, with a built-in token launchpad, a Uniswap v3 deployment (Gully Swap), passkey smart accounts and Gully Pay settlement.',
    links: {
      websites: ['https://gullychain.xyz/'],
      bridges: ['https://bridge.gullychain.xyz/'], // TODO: mainnet bridge (testnet: https://testnet-bridge.gullychain.xyz/)
      documentation: ['https://docs.gullychain.xyz/'],
      explorers: ['https://explorer.gullychain.xyz/'], // TODO: mainnet explorer (testnet: https://testnet-explorer.gullychain.xyz/)
      repositories: ['https://github.com/OffchainLabs/nitro'],
      socialMedia: ['https://x.com/Gully_Labs', 'https://t.me/GullyLabsNews'],
    },
  },
  chainConfig: {
    name: 'gullychain',
    chainId: 0, // TODO: mainnet chain id (testnet is 485590)
    explorerUrl: 'https://explorer.gullychain.xyz', // TODO
    sinceTimestamp: UnixTime(0), // TODO: mainnet genesis
    gasTokens: ['ETH'],
    // TODO: Multicall3 (0xcA11bde05977b3631167028862bE2a173976CA11) is not deployed on the testnet yet; deploy it
    // on mainnet before listing and put its deploy block here
    multicallContracts: [
      {
        address: EthereumAddress('0xcA11bde05977b3631167028862bE2a173976CA11'),
        batchSize: 150,
        sinceBlock: 0,
        version: '3',
      },
    ],
    apis: [
      // TODO: a Gully RPC endpoint reserved for L2BEAT (the public RPC is rate-limited);
      // https://rpc.gullyrpc.xyz/<project>/evm/<chainId>
      { type: 'rpc', url: 'https://rpc.gullychain.xyz', callsPerMinute: 600 },
      // TODO: the explorer is Ethernal, which has no Blockscout/Etherscan API; verify every contract on Sourcify so
      // discovery can read sources, or switch to Blockscout under a commercial licence
      { type: 'sourcify', url: 'https://sourcify.dev/server' },
    ],
  },
  bridge: discovery.getContract('Bridge'),
  rollupProxy: discovery.getContract('RollupProxy'),
  sequencerInbox: discovery.getContract('SequencerInbox'),
  // the template adds the Bridge (ETH escrow) itself; the token bridge gateways hold the ERC-20s.
  // TODO: mainnet addresses (testnet, Arbitrum Sepolia: standard 0x8E35E523bFd709d577A77F749c831cB045bCabd0,
  // custom 0xA90752f7057dc1BFe2677f1791c5084535A4E42a, WETH 0xEB602d8Fc5F5d87DA629201905bE51885165EC4f,
  // USDC 0xF904064BE100489a200EB754E591362C7Ced2D5b)
  nonTemplateEscrows: [
    discovery.getEscrowDetails({
      address: ChainSpecificAddress('arb1:0x0000000000000000000000000000000000000000'), // TODO L1ERC20Gateway
      tokens: '*',
      description:
        'Main entry point for users depositing ERC20 tokens. Upon depositing, on the L3 a generic, "wrapped" token will be minted.',
    }),
    discovery.getEscrowDetails({
      address: ChainSpecificAddress('arb1:0x0000000000000000000000000000000000000000'), // TODO L1CustomGateway
      tokens: '*',
      description:
        'Main entry point for users depositing ERC20 tokens that require minting a custom token on the L3.',
    }),
    discovery.getEscrowDetails({
      address: ChainSpecificAddress('arb1:0x0000000000000000000000000000000000000000'), // TODO L1WethGateway
      tokens: ['WETH'],
      description:
        'Escrows WETH deposited through the token bridge; the L3 side mints bridged WETH.',
    }),
    discovery.getEscrowDetails({
      address: ChainSpecificAddress('arb1:0x0000000000000000000000000000000000000000'), // TODO L1USDCGateway
      tokens: ['USDC'],
      description:
        'Escrows USDC behind USDC.e (bridged USDC, Circle bridged-USDC standard) minted on the L3 by the L2USDCGateway.',
    }),
  ],
  milestones: [
    {
      title: 'Gully Chain mainnet launch',
      url: 'https://gullychain.xyz/', // TODO: announcement link
      date: '2027-01-01T00:00:00Z', // TODO
      description: 'Gully Chain launches on Arbitrum One.',
      type: 'general',
    },
  ],
})
