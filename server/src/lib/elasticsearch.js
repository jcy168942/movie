import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

//local elasticsearch connect

/*
const client = new Client({
  host: process.env.LOCAL_ELASTIC_URL,
  node: process.env.LOCAL_ELASTIC_URL,
  log: "trace",
});
*/

//dev elasticsearch connect

const client = new Client({
    host: process.env.DEV_ELASTIC_URL,
    node: process.env.DEV_ELASTIC_URL,
    log: 'trace'
});

export default client;
