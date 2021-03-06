import { Paper, Grid } from '@mui/material';
import axios from 'axios';
import React, { FC, useContext, useEffect, useState } from 'react';
import dateFormat from 'dateformat';
import { WalletContext } from '../contexts/walletContext';
import TransferInfoRow from '../components/TransferInfoRow';

export interface IBSCTx {
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  txreceipt_status: string;
  gasUsed: string;
  confirmations: string;
  isError: string;
}

const layoutStyle = {
  boxSizing: 'border-box',
  height: '100%',
  overflow: 'scroll',
  padding: 2,
  gap: 2,
};

const paperStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: 2,
};

const Transactions: FC = function () {
  const [transactions, setTransactions] = useState<IBSCTx[]>([]);
  const { accounts } = useContext(WalletContext);

  useEffect(
    function () {
      async function fetchTransactions() {
        if (accounts) {
          const res = await axios.get<{ status: string; result: IBSCTx[] }>(
            `https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${
              accounts[0]
            }&startblock=1&endblock=9999999999&sort=desc&apikey=${
              process.env.REACT_APP_API_KEY as string
            }&page=1&offset=10`
          );
          if (res.data.status === '1') {
            setTransactions(res.data.result);
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchTransactions();
    },
    [accounts]
  );

  return (
    <Grid container flexDirection="column" flexWrap="nowrap" sx={layoutStyle}>
      {transactions.map(function (tx: IBSCTx) {
        return (
          <Paper sx={paperStyles} key={tx.blockHash} elevation={5}>
            <TransferInfoRow title="Block number" content={tx.blockNumber} />
            <TransferInfoRow
              title="Date"
              content={dateFormat(
                parseInt(tx.timeStamp, 10) * 1000,
                'mm/dd/yyyy hh:MM:ss'
              )}
            />
            <TransferInfoRow title="From" content={tx.from} />
            <TransferInfoRow title="To" content={tx.to} />
            <TransferInfoRow
              title="Gas fee"
              content={parseInt(tx.gasPrice, 10) * parseInt(tx.gasUsed, 10)}
            />
            <TransferInfoRow title="Amount" content={tx.value} />
          </Paper>
        );
      })}
    </Grid>
  );
};

export default Transactions;
