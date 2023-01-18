import * as anchor from '@project-serum/anchor'; // includes https://solana-labs.github.io/solana-web3.js/
// const { SystemProgram } = anchor.web3; // Added to initialize account
import idl from './target/idl/safe_pay.json';
// import { WalletAdaptorPhantom } from './wallet-adapter-phantom';
import { Idl, Program, Wallet } from '@project-serum/anchor';
import { SafePay } from './target/types/safe_pay';
import { PublicKey, Keypair, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { initilizeAccounts, readAccount } from './safePay'

import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import * as bs58 from "bs58";
import * as spl from '@solana/spl-token';
import assert from 'assert';

interface PDAParameters {
  escrowWalletKey: anchor.web3.PublicKey,
  stateKey: anchor.web3.PublicKey,
  escrowBump: number,
  stateBump: number,
  idx: anchor.BN,
}

interface TempParameters {
  mintAddress: anchor.web3.PublicKey,
  alice: anchor.web3.Keypair,
  aliceWallet: anchor.web3.PublicKey,
  bob: anchor.web3.Keypair,
  pda: PDAParameters
}

export default class AnchorClient {
  httpUri: string | undefined;

  programId: any;

  connection: anchor.web3.Connection | undefined;

  provider: anchor.AnchorProvider;

  program: Program<SafePay>;

  initializedAccounts: TempParameters;

  constructor() {
    this.provider = getProvider();
    this.program = getProgram();

    console.log(this.provider);
    // this.program = new anchor.Program.at(this.programId, this.provider);
  }

  async initialize() {
    // generate an address (PublciKey) for this new account
    console.log("Initializing accounts");


    //Fund account
    const connection = this.provider.connection;
    const account = this.provider.publicKey;
    const airdropSignature = await connection.requestAirdrop(
      account,
      60 * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(airdropSignature);
    this.initializedAccounts = await initilizeAccounts(this.provider);

    console.log(`Initializing accounts: `, this.initializedAccounts);
    return this.initializedAccounts;
  }

  initializeSafePaymentBy = async () => {

    const amount = new anchor.BN(20000000);

    await this.program.rpc.initializeNewGrant(
      this.initializedAccounts.pda.idx,
      this.initializedAccounts.pda.stateBump,
      this.initializedAccounts.pda.escrowBump,
      amount, {
      accounts: {
        applicationState: this.initializedAccounts.pda.stateKey,
        escrowWalletState: this.initializedAccounts.pda.escrowWalletKey,
        mintOfTokenBeingSent: this.initializedAccounts.mintAddress,
        recruiter: this.initializedAccounts.alice.publicKey,
        candidate: this.initializedAccounts.bob.publicKey,
        walletToWithdrawFrom: this.initializedAccounts.aliceWallet,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [this.initializedAccounts.alice],
    });

    console.log(`Initialized a new Safe Pay instance. Alice will pay bob 20 tokens`);
  }

  isAuthorizedToSlot = async (): Promise<boolean> => {

    const state = await this.program.account.state.fetch(this.initializedAccounts.pda.stateKey);

    console.log('Interview price: ', state.interviewPrice.toString());
    console.log('Is authorized to reserve slot: ', state.isAuthorizedToReserveSlot.toString());
    
    return state.isAuthorizedToReserveSlot;
  }

  completeGrant = async () => {

    // Create a token account for Bob.
    const bobTokenAccount = await getAssociatedTokenAddress(
      this.initializedAccounts.mintAddress,
      this.initializedAccounts.bob.publicKey,
      false
    )
    console.log('Escrow wallet: ', this.initializedAccounts.pda.escrowWalletKey.toString())

    // await this.program.rpc.completeGrant(
    //   this.initializedAccounts.pda.idx,
    //   this.initializedAccounts.pda.stateBump,
    //   this.initializedAccounts.pda.escrowBump, {
    //   accounts: {
    //     applicationState: this.initializedAccounts.pda.stateKey,
    //     escrowWalletState: this.initializedAccounts.pda.escrowWalletKey,
    //     mintOfTokenBeingSent: this.initializedAccounts.mintAddress,
    //     userSending: this.initializedAccounts.alice.publicKey,
    //     userReceiving: this.initializedAccounts.bob.publicKey,
    //     walletToDepositTo: bobTokenAccount,

    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    //   },
    //   signers: [this.initializedAccounts.bob],
    // });

    // // Assert that 20 tokens were sent back.
    // const [, bobBalance] = await readAccount(bobTokenAccount, this.provider);
    // assert.equal(bobBalance, '20000000');
    // console.log("Account balance for Bob: ", bobBalance);

  }

  pullBackFunds = async () => {

    // // Assert that 20 tokens were moved from Alice's account to the escrow.
    // const [, aliceBalancePost] = await readAccount(this.initializedAccounts.aliceWallet, this.provider);
    // assert.equal(aliceBalancePost, '1317000000');
    // const [, escrowBalancePost] = await readAccount(this.initializedAccounts.pda.escrowWalletKey, this.provider);
    // assert.equal(escrowBalancePost, '20000000');

    // await this.program.rpc.pullBack(
    //   this.initializedAccounts.pda.idx, 
    //   this.initializedAccounts.pda.stateBump, 
    //   this.initializedAccounts.pda.escrowBump, {
    //   accounts: {
    //     applicationState: this.initializedAccounts.pda.stateKey,
    //     escrowWalletState: this.initializedAccounts.pda.escrowWalletKey,
    //     mintOfTokenBeingSent: this.initializedAccounts.mintAddress,
    //     userSending: this.initializedAccounts.alice.publicKey,
    //     userReceiving: this.initializedAccounts.bob.publicKey,
    //     refundWallet: this.initializedAccounts.aliceWallet,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //     tokenProgram: spl.TOKEN_PROGRAM_ID,
    //   },
    //   signers: [this.initializedAccounts.alice],
    // });

    // // Assert that 20 tokens were sent back.
    // const [, aliceBalanceRefund] = await readAccount(this.initializedAccounts.aliceWallet, this.provider);
    // assert.equal(aliceBalanceRefund, '1337000000');

    // // Assert that escrow was correctly closed.
    // try {
    //     const data = await readAccount(this.initializedAccounts.pda.escrowWalletKey, this.provider);
    //     // console.log("Data: ", data);
    //     if (data.length != 0) // if length > 0, account is not closed.
    //       return assert.fail("Account should be closed");
    // } catch (e) {
    //     console.error(e.message, "Cannot read properties of null (reading 'data')");
    // }

    // const state = await this.program.account.state.fetch(this.initializedAccounts.pda.stateKey);
    // assert.equal(state.amountTokens.toString(), '20000000');
    // assert.equal(state.stage.toString(), '3');

  }
}
// create a network and wallet context provider
const getProvider = () => {
  const httpUri = 'http://localhost:8899';
  const connection = new anchor.web3.Connection(httpUri, 'confirmed');

  const bs58StringKey = bs58.decode("54uBa2M37Sn8NHWmyQpeQ1NJfKT1VVuF9HdNHZgCunht4UaKL6LfHGKM2kBqtXgV8VTeJ7rTbKJXdysbQ8GtSZUb");
  const userKey = Keypair.fromSecretKey(bs58StringKey);
  const wallet = new MyWallet(userKey);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  return provider;
};

// helper function to get the program
const getProgram = () => {

  // get program id from IDL, the metadata is only available after a deployment
  const programID = getProgramId();

  console.log('Program id: ', programID.toString());

  const program = new Program(
    idl as Idl,
    programID,
    getProvider()
  ) as unknown as Program<SafePay>;
  return program;
};

export const getProgramId = () => new PublicKey(idl.metadata.address);


export class MyWallet implements Wallet {

  constructor(readonly payer: Keypair) {
    this.payer = payer
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}
