import { Connection } from "@solana/web3.js";
import { RPC_URLS } from "./constants";

export const socketConnections: Connection[] = getConnectionsForSocket();

function getConnectionsForSocket() {
    const connections = [];
    for (let i = 0; i < 100; i++) {
        const random = Math.floor(Math.random() * RPC_URLS.length);
        const connection = new Connection(RPC_URLS[random]);
        connections.push(connection);
    }

    return connections;
}