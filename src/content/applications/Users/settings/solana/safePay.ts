import * as anchor from '@project-serum/anchor';
import { MySolanaProvider, getProgramId } from './anchorClient';
import * as spl from '@solana/spl-token';
import {
    MintLayout,
    TOKEN_PROGRAM_ID,
    createInitializeMintInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction
  } from "@solana/spl-token";
import { AccountInfo, Keypair, Signer } from '@solana/web3.js';
import * as bs58 from "bs58";
// import {BN} from 'bn.js';
import { PublicKey, TransactionBlockhashCtor } from '@solana/web3.js';
import { bg } from 'date-fns/locale';
import { BN } from 'bn.js';
import { arrayOf } from 'prop-types';

interface PDAParameters {
    escrowWalletKey: anchor.web3.PublicKey,
    stateKey: anchor.web3.PublicKey,
    escrowBump: number, // walletBump
    stateBump: number,
    idx: anchor.BN,
}

let mintAddress: anchor.web3.PublicKey;
// let alice: Keypair;
let aliceWallet: anchor.web3.PublicKey | undefined;
let bob: anchor.web3.Keypair;
// let pda: PDAParameters;



const getPdaParams = async (connection: anchor.web3.Connection, alice: anchor.web3.PublicKey, bob: anchor.web3.PublicKey, mint: anchor.web3.PublicKey): Promise<PDAParameters> => {
    const programID = getProgramId();
    const uid = new anchor.BN(parseInt((Date.now() / 1000).toString()));
    const uidBuffer = uid.toArrayLike(Buffer, 'le', 8);

    let [statePubKey, stateBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("state"), alice.toBuffer(), bob.toBuffer(), mint.toBuffer(), uidBuffer], programID,
    );
    let [walletPubKey, walletBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("wallet"), alice.toBuffer(), bob.toBuffer(), mint.toBuffer(), uidBuffer], programID,
    );
    return {
        idx: uid,
        escrowBump: walletBump, // escrowBump
        escrowWalletKey: walletPubKey,
        stateBump,
        stateKey: statePubKey,
    }
}

const createMint = async (provider: MySolanaProvider): Promise<anchor.web3.PublicKey> => {
    const tokenMint = new anchor.web3.Keypair();

    const connection = provider.connection
    const lamportsForMint = await connection.getMinimumBalanceForRentExemption(spl.MintLayout.span);
    const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
    const fromPubkey = await provider.wallet.getPublicKey();

    console.log("Last blockhast: ", blockhash);

    // const b = {blockhash} as TransactionBlockhashCtor;    
    let tx = new anchor.web3.Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;
   
    
    // Allocate mint
    tx.add(
        anchor.web3.SystemProgram.createAccount({
            programId: spl.TOKEN_PROGRAM_ID,
            space: spl.MintLayout.span,
            fromPubkey: fromPubkey,
            newAccountPubkey: tokenMint.publicKey,
            lamports: lamportsForMint,
        })
    )
    // Allocate wallet account
    tx.add(
        createInitializeMintInstruction(
            tokenMint.publicKey,
            6,
            fromPubkey,
            fromPubkey
        )
    );

    try {

        // const adsf = tokenMint as Signer;

        tx.partialSign(tokenMint)
        

        const signedTx = await provider.wallet.signTransaction(tx);

        // const anchorProvider = new anchor.AnchorProvider(connection, provider.wallet, {
        //     preflightCommitment: "confirmed",
        // });


        const signature = await provider.wallet.connection.sendRawTransaction(signedTx.serialize());

        // provider.wallet.solanaWallet.signTransaction

        // anchorProvider.wallet.signTransaction

        // const sSignature = await anchorProvider.sendAndConfirm(tx, [tokenMint]);
        console.log("A ");
        console.log(`[${tokenMint.publicKey}] Created new mint account at ${signature}`);
    } catch (error) {
        console.log("ERROR: ,", error)
    }
    

    return tokenMint.publicKey;
}

const createAssociatedWallet = async (provider: MySolanaProvider, mint?: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey | undefined> => {
    let user = await provider.wallet.getPublicKey();
    
    const connection = provider.connection;
    const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
    const fromPubkey = await provider.wallet.getPublicKey();

    // Fund user with some SOL
    let txFund = new anchor.web3.Transaction();
    txFund.recentBlockhash = blockhash;
    txFund.feePayer = fromPubkey;

    txFund.add(anchor.web3.SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: user,
        lamports: 2 * anchor.web3.LAMPORTS_PER_SOL,
    }));
    const sigTxFund = await provider.sendAndConfirm(txFund);
    console.log(`[${user.toBase58()}] Funded new account with 5 SOL: ${sigTxFund}`);


    let userAssociatedTokenAccount: anchor.web3.PublicKey | undefined = undefined;

    if (mint) {
        // Create a token account for the user and mint some tokens
        userAssociatedTokenAccount = await getAssociatedTokenAddress(
            mint,
            user,
            false,
            spl.TOKEN_PROGRAM_ID,
            spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        )

        const txFundTokenAccount = new anchor.web3.Transaction();
        txFundTokenAccount.add(createAssociatedTokenAccountInstruction(
            user,
            userAssociatedTokenAccount,
            user,
            mint,
            spl.TOKEN_PROGRAM_ID,
            spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        ))
        txFundTokenAccount.add(createMintToInstruction(
            mint,
            userAssociatedTokenAccount,
            fromPubkey,
            1337000000,
            [],
            spl.TOKEN_PROGRAM_ID
        ));

        console.log("Mint account: ", mint.toString());
        console.log("userAssociatedTokenAccount account: ", userAssociatedTokenAccount.toString());
        console.log("provider.wallet.publicKey account: ", fromPubkey);
        console.log("user account: ", user.toString());
        txFundTokenAccount.recentBlockhash = blockhash;
        txFundTokenAccount.feePayer = fromPubkey;

        // const a = [user as Signer];
        const txFundTokenSig = await provider.sendAndConfirm(txFundTokenAccount);
        console.log(`[${userAssociatedTokenAccount.toBase58()}] New associated account for mint ${mint.toBase58()}: ${txFundTokenSig}`);
    }
    return userAssociatedTokenAccount;
}

const createUser = async (provider: MySolanaProvider, useDefaultUser: boolean = true): Promise<anchor.web3.Keypair> => {
    let user: anchor.web3.Keypair; 

    if (useDefaultUser) {
        const bs58StringKey = bs58.decode("54uBa2M37Sn8NHWmyQpeQ1NJfKT1VVuF9HdNHZgCunht4UaKL6LfHGKM2kBqtXgV8VTeJ7rTbKJXdysbQ8GtSZUb");
        user = Keypair.fromSecretKey(bs58StringKey);
    } else {
        user = new anchor.web3.Keypair();
    }

    const connection = provider.connection;
    const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
    const fromPubkey = await provider.wallet.getPublicKey();

    // Fund user with some SOL
    let txFund = new anchor.web3.Transaction();
    txFund.recentBlockhash = blockhash;
    txFund.feePayer = fromPubkey;

    txFund.add(anchor.web3.SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: user.publicKey,
        lamports: 2 * anchor.web3.LAMPORTS_PER_SOL,
    }));
    const sigTxFund = await provider.sendAndConfirm(txFund);
    console.log(`[${user.publicKey.toBase58()}] Funded new account with 5 SOL: ${sigTxFund}`);

    return user;
}

export const readAccount = async (accountPublicKey: anchor.web3.PublicKey, provider: anchor.Provider): Promise<[AccountInfo<any>, string] | []> => {
    const tokenInfoLol = await provider.connection.getAccountInfo(accountPublicKey);
    const arrayBuffer = tokenInfoLol?.data;

    if (arrayBuffer) {
        const data = Buffer.from(arrayBuffer);
        const accountInfo = spl.AccountLayout.decode(data);
    
        // const amount = (accountInfo.amount as any as Buffer).readBigUInt64LE();
        const amount = accountInfo.amount
    
        console.log(`Amount to read: ${amount}`);
      
        // const amount = await.provider
    
        return [tokenInfoLol, amount.toString()];
    }
    return [];
}


export const initilizeAccounts = async (provider: MySolanaProvider) => {
    mintAddress = await createMint(provider);
    
    aliceWallet = await createAssociatedWallet(provider, mintAddress);

    try {
        bob = await createUser(provider, false);
    } catch (error) {
        console.log(error);
    }
    
    const alicePubKey = await provider.getPublicKey();

    const pda = await getPdaParams(provider.connection, alicePubKey, bob.publicKey, mintAddress);

    console.log('Initialized PDA:', pda)

    console.log('escrowWalletKey/escrowWalletState: ', pda.escrowWalletKey.toString());
    console.log('stateKey/applicationState: ', pda.stateKey.toString());
    console.log('escrowBump/walletBump: ', pda.escrowBump.toString());
    console.log('stateBump: ', pda.stateBump.toString());
    console.log('idx: ', pda.idx.toString());

    console.log('bob: ', bob.publicKey.toString());

    console.log('mintAddress: ', mintAddress.toString());
    // console.log('alice: ', alice.toString());
    console.log('aliceWallet: ', aliceWallet.toString());
    console.log('provider account wallet key: ', (await provider.getPublicKey()).toString());

    return {
        mintAddress,
        aliceWallet,
        bob,
        pda,
    }
};


