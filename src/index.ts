import { MINT_LIST } from "./mint-list";
import { KeyedAccountInfo, PublicKey } from "@solana/web3.js";
import { blob, nu64, struct } from "@solana/buffer-layout";
import { socketConnections } from "./connection";
import { TOKEN_PROGRAM_ID } from "./constants";

const ACCOUNT_LAYOUT = struct<{
    mint: Uint8Array;
    owner: Uint8Array;
    amount: number;
}>([blob(32, 'mint'), blob(32, 'owner'), nu64('amount'), blob(93)]);
const subscriptions: Record<string, number> = {};

export const startListenersForAllNfts = async (
    onTxDetect: (account: KeyedAccountInfo, mintAddress: string) => void,
) => {
    for (let i = 0; i < MINT_LIST.length; i++) {
        if (i % 50 === 0) {
            await sleep(600);
            console.log('index', i);
        }
        subscribeNft(MINT_LIST[i], onTxDetect);
    }
};

export const subscribeNft = (
    mintAddress: string,
    onTxDetect: (account: KeyedAccountInfo, mintAddress: string) => void,
) => {
    const connection = socketConnections[Math.floor(Math.random() * socketConnections.length)];
    try {
        subscriptions[mintAddress] = connection.onProgramAccountChange(
            new PublicKey(TOKEN_PROGRAM_ID),
            (account) => {
                onTxDetect(account, mintAddress);
            },
            'finalized',
            [
                {
                    memcmp: {
                        offset: ACCOUNT_LAYOUT.offsetOf('mint')!,
                        bytes: mintAddress,
                    },
                },
            ],
        );
    } catch (e) {
        console.log('error', e);
        console.log('endpoint', connection.rpcEndpoint);
    }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

startListenersForAllNfts((account, mintAddress) => {
    console.log('account', account);
    console.log('mintAddress', mintAddress);
}).then(() => console.log('done'));