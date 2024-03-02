
<p align="center">
<img src="https://github.com/cesarhuret/0xFrame/assets/67405604/b45a1a08-dc62-4feb-94ea-ab41ffd95a7e" width="400" style="border-radius: 10px" />
  <br/>
  <br/>
  <br/>
  An all in one user interface where you can access any crypto protocol, with any asset, from any blockchain
</p>

### Problem

Currently, when interacting with dApps, if you have insufficient token balances, that’s the end of using the dApp. It doesn’t even let you simulate the TX. 

0xFrame addresses this very problem, the problem of a complex and disjointed user experience in the crypto space. Users currently face difficulties due to the lack of a unified interface and the limited ability to operate across different blockchain networks. This fragmentation results in barriers that prevent users from smoothly utilizing dApps and managing their assets.

0xFrame offers a solution by providing a seamless interface where users can access any crypto protocol with any asset from any blockchain. It simplifies the interaction with dApps by allowing users to carry out transactions even if they do not have the required token balance on the right chain. Instead of stopping users at the point of insufficient balances, 0xFrame displays their available balances across all compatible EVM chains. It enables users to select which assets to use for their intended transaction.

If the asset is on a different chain, 0xFrame handles the necessary asset swaps and bridges the tokens to the correct chain using 0x Swap API for swaps and Chainlink Cross-Chain Interoperability Protocol (CCIP) for bridging. This automation streamlines the process, removing the need for users to manually swap or bridge assets, which can be a complex and error-prone process.

For example, if you want to deposit USDT to Base but only have ETH on Arbitrum, the general flow of 0xFrame is: 1) swap user’s ETH to USDC with 0x Swap API, 2) bridge USDC from Arbitrum to Base with Chainlink CCIP, 3) swap user’s USDC to USDT with 0x Swap API, 4) deposit USDT to AAVE. Of course, the user only has to sign two transactions (the initial and end transactions), simplifying the UX of the current traditional flow, which would involve at least 4 transactions and 3 different user interfaces.


#### Example
<img width="2448" alt="0xFrame Interface Flow (example) (1)" src="https://github.com/cesarhuret/0xFrame/assets/67405604/1dbf1734-92bb-4d27-ad99-10934cfa40ac">

#### Frontend

![](https://github.com/cesarhuret/0xFrame/assets/67405604/2da02ef1-a080-4de2-8d2b-b1941df3e6d6) | ![](https://github.com/cesarhuret/0xFrame/assets/67405604/cd2d9f97-de04-49c9-aca8-8c446cc323ea)
:-------------------------:|:-------------------------:

### Local Development


#### Smart Contract Deployment

1. `cd contracts`
2. Deploy Executor.sol - either using `forge create` or the `SwapDeployer.s.sol` script

#### Frontend
1. `cd frontend`
2. `npm i`
3. Fill in the API Keys in `urlConfigs.ts`
4. `npm start`
5. Choose a contract and function you want to interact with
6. Fill in the arguments
7. Create the link.
