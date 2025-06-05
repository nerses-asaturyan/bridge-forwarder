import axios from 'axios';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
dotenv.config();

const API_KEY = process.env.API_KEY;
const METHOD = process.env.METHOD;

async function fetchNetworks() {
    try {
        if (!API_KEY || !METHOD) {
            throw new Error('API_KEY and METHOD must be set in your .env file');
        }

        const { data } = await axios.get(
            METHOD,
            {
                headers: {
                    'X-LS-APIKEY': API_KEY,
                    Accept: 'application/json',
                },
            }
        );

        const simplified = Array.isArray(data.data)
            ? data.data.map((network: any) => ({
                name: network.name,
                chain_id: network.chain_id,
                node_url: network.node_url,
                token_symbol: network.token?.symbol ?? null,
                decimals: network.token?.decimals ?? null
            }))
            : [];

        writeFileSync(
            'networks-simple.json',
            JSON.stringify(simplified, null, 2),
            'utf-8'
        );

        writeFileSync(
            'networks.json',
            JSON.stringify(data, null, 2),
            'utf-8'
        );

        console.log('✅ Data has been saved');
    } catch (err: any) {
        console.error(
            'Request failed:',
            err.response?.status,
            err.response?.data || err.message
        );
    }
}

fetchNetworks();
