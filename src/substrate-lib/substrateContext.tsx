import React, {
  FC,
  useReducer,
  useContext,
  createContext,
  Dispatch
} from 'react';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { KeyringInstance } from '@polkadot/keyring/types';
import queryString from 'query-string';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';

import config from '../config';

const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

type State = {
  socket: string | string[];
  jsonrpc: {};
  keyring: KeyringInstance;
  keyringState: 'LOADING' | 'READY' | 'ERROR';
  api: any; // ApiPromise but trouble in balances.tsx with codec;
  apiError: Error;
  apiState: 'CONNECT_INIT' | 'CONNECTING' | 'READY' | 'ERROR';
};

type Action =
  | { type: 'CONNECT_INIT' }
  | { type: 'CONNECT'; payload: ApiPromise }
  | { type: 'CONNECT_SUCCESS' }
  | { type: 'CONNECT_ERROR'; payload: Error }
  | { type: 'LOAD_KEYRING' }
  | { type: 'SET_KEYRING'; payload: any }
  | { type: 'KEYRING_ERROR' };

///
// Initial state for `useReducer`

const INIT_STATE: State = {
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.RPC },
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null
};

///
// Reducer function for `useReducer`

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' };

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload };

    case 'LOAD_KEYRING':
      return { ...state, keyringState: 'LOADING' };

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' };

    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' };

    default:
      return { ...state };
  }
};

///
// Connecting to the Substrate node

const connect = (state: State, dispatch: Dispatch<Action>) => {
  const { apiState, socket, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then(_api => dispatch({ type: 'CONNECT_SUCCESS' }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
  _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }));
};

///
// Loading accounts from dev and polkadot-js extension

let loadAccts = false;
const loadAccounts = (state: State, dispatch: Dispatch<Action>) => {
  const asyncLoadAccounts = async () => {
    dispatch({ type: 'LOAD_KEYRING' });
    try {
      await web3Enable(config.APP_NAME);
      let allAccounts = await web3Accounts();
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` }
      }));
      keyring.loadAll(
        { isDevelopment: config.DEVELOPMENT_KEYRING },
        allAccounts
      );
      dispatch({ type: 'SET_KEYRING', payload: keyring });
    } catch (e) {
      console.error(e);
      dispatch({ type: 'KEYRING_ERROR' });
    }
  };

  const { keyringState } = state;
  // If `keyringState` is not null `asyncLoadAccounts` is running.
  if (keyringState) return;
  // If `loadAccts` is true, the `asyncLoadAccounts` has been run once.
  if (loadAccts) return dispatch({ type: 'SET_KEYRING', payload: keyring });

  // This is the heavy duty work
  loadAccts = true;
  asyncLoadAccounts();
};

const SubstrateContext = createContext(INIT_STATE);

type SubstrateContextProviderTypes = {
  socket?: string;
  [x: string]: any;
};

const SubstrateContextProvider: FC<SubstrateContextProviderTypes> = props => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const neededPropNames = ['socket'];
  neededPropNames.forEach(key => {
    initState[key] =
      typeof props[key] === 'undefined'
        ? initState[key]
        : (props[key] as State['apiState']);
  });

  const [state, dispatch] = useReducer(reducer, initState);
  connect(state, dispatch);
  loadAccounts(state, dispatch);

  return (
    <SubstrateContext.Provider value={state}>
      {props.children}
    </SubstrateContext.Provider>
  );
};

const useSubstrate = () => useContext<State>(SubstrateContext);

export { SubstrateContextProvider, useSubstrate };
