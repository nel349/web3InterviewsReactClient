import { toBigNumber } from '@metaplex-foundation/js';
// import { Keypair } from '@solana/web3.js';

// // Create the Collection NFT.
// const { nft: collectionNft } = await metaplex.nfts().create({
//   name: 'My Collection NFT',
//   uri: 'https://example.com/path/to/some/json/metadata.json',
//   sellerFeeBasisPoints: 0,
//   isCollection: true,
// });

// // Create the Candy Machine.
// const { candyMachine } = await metaplex.candyMachines().create({
//   itemsAvailable: toBigNumber(5000),
//   sellerFeeBasisPoints: 333, // 3.33%
//   collection: {
//     address: collectionNft.address,
//     updateAuthority: metaplex.identity(),
//   },
// });