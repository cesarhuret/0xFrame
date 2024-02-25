import type { MetaMaskInpageProvider } from '@metamask/providers';

import { defaultSnapOrigin } from '../config';
import type { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (error) {
    console.log('Failed to obtain installed snap', error);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  console.log({
    to: '0x6b175474e89094c44da98b954eedeac495271d0f',
    from: '0x08cFE6B091088f42807B3a01fdAe196E4bA981b8',
    data: '0x70a08231000000000000000000000000fa9f52dee9172d22d01df17d5dbd48135cfaf028',
  });

  const accounts: any = await window.ethereum.request({
    method: 'eth_requestAccounts',
    params: [],
  });

  console.log('accounts', accounts);

  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: {
      from: '0xb934f1d4d61eeb6f691070e0556bf756ceca0de7',
      gas: '0x5208',
      to: '0x08cfe6b091088f42807b3a01fdae196e4ba981b8',
      value: '0x38d7ea4c68000',
      maxFeePerGas: '0x59682f0b',
      maxPriorityFeePerGas: '0x59682f00',
    },
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
