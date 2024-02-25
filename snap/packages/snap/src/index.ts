import type {
  Component,
  OnRpcRequestHandler,
  OnTransactionHandler,
  Transaction,
} from '@metamask/snaps-sdk';
import {
  ManageStateOperation,
  address,
  assert,
  button,
  divider,
  form,
  heading,
  image,
  input,
  panel,
  row,
  spinner,
  text,
} from '@metamask/snaps-sdk';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([heading('Please wait...'), spinner()]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  const insights = [transaction, chainId, transactionOrigin];

  console.log('Here, we simulate the transaction');

  console.log(transaction);

  const url =
    'https://rpc.ankr.com/multichain/b4f56c3dadaf8fec029d80e264049252cdcc001ce945814a9d6118f939a2a6c9';

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'ankr_getAccountBalance',
      params: {
        blockchain: ['bsc', 'eth', 'polygon', 'avalanche'],
        walletAddress: '0xfa9019df60d3c710d7d583b2d69e18d412257617',
      },
    }),
  };

  const balances = await fetch(url, requestOptions);

  const json = await balances.json();

  const assets = json.result.assets;

  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.UpdateState,
      newState: { transaction },
    },
  });

  return {
    content: panel([
      heading('Select any token to pay with'),
      ...assets
        .sort(
          (a: any, b: any) =>
            parseFloat(b.balanceUsd) - parseFloat(a.balanceUsd),
        )
        .map((asset: any) =>
          panel([divider(), row(asset.tokenSymbol, text(asset.balance))]),
        ),
    ]),
  };
  // content: panel([
  //   heading('Here, we simulate the transaction'),
  //   text('Here, we simulate the transaction'),
  //   // ...assets.map((asset: any) =>
  //   // button(`${assets[0].tokenSymbol}: ${assets[0].balance}`),
  //   // button({ variant: 'primary', value: 'Hello, world!', name: 'myButton' }),
  //   // ),
  // ]),
};
