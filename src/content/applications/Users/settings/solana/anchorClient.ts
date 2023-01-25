import * as anchor from '@project-serum/anchor'; // includes https://solana-labs.github.io/solana-web3.js/
// const { SystemProgram } = anchor.web3; // Added to initialize account
import idl from './target/idl/safe_pay.json';
// import { WalletAdaptorPhantom } from './wallet-adapter-phantom';
import { Idl, Program, Provider } from '@project-serum/anchor';
import { SafePay } from './target/types/safe_pay';
import { PublicKey, Keypair, Transaction, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { initilizeAccounts, readAccount } from './safePay'

import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { SolanaWallet } from "@web3auth/solana-provider";

import { Wallet } from "@project-serum/anchor/dist/cjs/provider"
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

interface PDAParameters {
  escrowWalletKey: anchor.web3.PublicKey,
  stateKey: anchor.web3.PublicKey,
  escrowBump: number,
  stateBump: number,
  idx: anchor.BN,
}

interface TempParameters {
  mintAddress: anchor.web3.PublicKey,
  aliceWallet: anchor.web3.PublicKey,
  bob: anchor.web3.Keypair,
  pda: PDAParameters
}

export default class AnchorClient {
  httpUri: string | undefined;

  programId: any;

  connection: anchor.web3.Connection | undefined;

  walletProvider:  MySolanaProvider;

  program: Program<SafePay>;

  initializedAccounts: TempParameters;

  constructor(walletProvider: MySolanaProvider) {


    this.walletProvider = walletProvider;

    // this.provider = getProvider();

    const mySolanaProvider = new MySolanaProvider(walletProvider.connection, walletProvider.wallet);

    this.program = getProgram(mySolanaProvider);
    this.connection = this.walletProvider.connection;

    console.log("My Solana wallet provider: ", this.walletProvider.wallet.solanaWallet);
    // this.program = new anchor.Program.at(this.programId, this.provider);
  }

  async initialize() {
    // generate an address (PublciKey) for this new account
    console.log("1. Initializing accounts");

    //Fund account
    const connection = this.walletProvider.connection;
    // const account = await this.walletProvider.getPublicKey();

    // let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    

    this.initializedAccounts = await initilizeAccounts(this.walletProvider);

    console.log(`2. Initialized accounts: `, this.initializedAccounts);
    return this.initializedAccounts;
  }

  initializeSafePaymentBy = async () => {

    const amount = new anchor.BN(20000000);

    const wallet = this.walletProvider.wallet.solanaWallet;
    
    const pubkey = await this.walletProvider.getPublicKey();

    // const a = await this.program.rpc.initializeNewGrant(
    //   this.initializedAccounts.pda.idx,
    //   this.initializedAccounts.pda.stateBump,
    //   this.initializedAccounts.pda.escrowBump,
    //   amount, {
    //   accounts: {
    //     applicationState: this.initializedAccounts.pda.stateKey,
    //     escrowWalletState: this.initializedAccounts.pda.escrowWalletKey,
    //     mintOfTokenBeingSent: this.initializedAccounts.mintAddress,
    //     recruiter: this.initializedAccounts.alice.publicKey,
    //     candidate: this.initializedAccounts.bob.publicKey,
    //     walletToWithdrawFrom: this.initializedAccounts.aliceWallet,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //   },
    //   signers: [this.initializedAccounts.alice],
    // });


    const tx = this.program.transaction.initializeNewGrant(
      this.initializedAccounts.pda.idx,
      this.initializedAccounts.pda.stateBump,
      this.initializedAccounts.pda.escrowBump,
      amount, 
      {
        accounts: {
          applicationState: this.initializedAccounts.pda.stateKey,
          escrowWalletState: this.initializedAccounts.pda.escrowWalletKey,
          mintOfTokenBeingSent: this.initializedAccounts.mintAddress,
          recruiter: pubkey,
          candidate: this.initializedAccounts.bob.publicKey,
          walletToWithdrawFrom: this.initializedAccounts.aliceWallet,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        }
      }
    );

    const blockhash = (await this.connection.getLatestBlockhash("finalized")).blockhash;

    console.log("Blockhash in initializeSafePaymentBy method: ", blockhash)

    tx.feePayer = pubkey;
    tx.recentBlockhash = blockhash;

    const signed = await wallet.signTransaction(tx);
    console.log("Serialized message: ", signed.serialize().toString("base64"));

    const txsignature = await this.connection.sendRawTransaction(signed.serialize());

    // const signatureResult = await this.connection.confirmTransaction(txsignature);
    console.log("TxID: ", txsignature);
    // console.log("signatureResult: ", signatureResult)

    console.log(`Initialized a new Safe Pay instance. Alice will pay bob 20 tokens`);
  }

  isAuthorizedToSlot = async (): Promise<boolean> => {

    const state = await this.program.account.state.fetch(this.initializedAccounts.pda.stateKey);

    console.log('Interview price: ', state.interviewPrice.toString());
    console.log('Is authorized to reserve slot: ', state.isAuthorizedToReserveSlot.toString());

    // const recruiter = state.recruiter;
    // const currentAccountPubKey = await this.walletProvider.getPublicKey();
    // const accountsMatch = recruiter.toString() == currentAccountPubKey.toString();

    // console.log("Accounts match: ", accountsMatch);
    
    return false;
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
// const getProvider = () => {
//   const httpUri = 'http://localhost:8899';
//   const connection = new anchor.web3.Connection(httpUri, 'confirmed');

//   const bs58StringKey = bs58.decode("54uBa2M37Sn8NHWmyQpeQ1NJfKT1VVuF9HdNHZgCunht4UaKL6LfHGKM2kBqtXgV8VTeJ7rTbKJXdysbQ8GtSZUb");
//   const userKey = Keypair.fromSecretKey(bs58StringKey);
//   const wallet = new MyWallet(userKey);
//   const provider = new anchor.AnchorProvider(connection, wallet, {
//     preflightCommitment: "confirmed",
//   });
//   return provider;
// };

// helper function to get the program
const getProgram = (provider: MySolanaProvider) => {

  // get program id from IDL, the metadata is only available after a deployment
  const programID = getProgramId();

  console.log('Program id: ', programID.toString());

  const program = new Program(
    idl as Idl,
    programID,
    provider,
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

export class MySolanaWallet implements Wallet {

  connection: Connection;

  solanaWallet: SolanaWallet;

  publicKey: PublicKey;

  constructor(solanaWallet: SolanaWallet, connection: Connection) {
    this.connection = connection;
    this.solanaWallet = solanaWallet;
  }

  signTransaction(tx: Transaction): Promise<Transaction> {
    return this.solanaWallet.signTransaction(tx);
  }

  signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return this.solanaWallet.signAllTransactions(txs);
  }

  // Get the first public key in solana wallet accounts.
  async getPublicKey(): Promise<PublicKey> {
    const accounts = await this.accounts();
    return new PublicKey(accounts[0]);
  }

  async accounts(): Promise<string[]> {
    return await this.solanaWallet.requestAccounts();
  }

  //Assuming user is already logged in.
  async getPrivateKey() {
    const privateKey: any = await this.solanaWallet.request({
      method: "solanaPrivateKey"
    });
    return String(privateKey);
  }
}

export class MySolanaProvider implements Provider {

  wallet: MySolanaWallet;

  connection: anchor.web3.Connection;

  publicKey?: anchor.web3.PublicKey;

  constructor(connection: Connection, wallet: MySolanaWallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  async getPublicKey(): Promise<PublicKey> {
    return await this.wallet.getPublicKey();
  }

  async getPrivateKey(): Promise<string> {
    return await this.wallet.getPrivateKey();
  }

  async send(tx: anchor.web3.Transaction,
        signers?: anchor.web3.Signer[],
        opts?: anchor.web3.SendOptions): Promise<string> {
          const wallet  = this.wallet.solanaWallet;
          const { signature } = await wallet.signAndSendTransaction(tx);
          return signature;
  }

  async sendAndConfirm(tx: anchor.web3.Transaction, signers?: anchor.web3.Signer[], opts?: anchor.web3.ConfirmOptions): Promise<string>{
    const wallet  = this.wallet.solanaWallet;

    console.log("sendAndConfirm signers: ",  signers);

    if (signers !== undefined) {
      signers.forEach((signer) => {
        tx.partialSign(signer);
      })
    }
    
    const { signature } = await wallet.signAndSendTransaction(tx);
    return signature;
  }
  async sendAll?(txWithSigners: { tx: anchor.web3.Transaction; signers?: anchor.web3.Signer[]; }[], opts?: anchor.web3.ConfirmOptions): Promise<string[]>{
    // const wallet  = this.wallet.solanaWallet;
    // const { signature } = await wallet.send);
    return new Promise<string[]>(null);
  }
  simulate?(tx: anchor.web3.Transaction, signers?: anchor.web3.Signer[], commitment?: anchor.web3.Commitment, includeAccounts?: boolean | anchor.web3.PublicKey[]): Promise<anchor.utils.rpc.SuccessfulTxSimulationResponse>;

}
