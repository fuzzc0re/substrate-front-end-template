import React, { FC, useState, createRef } from 'react';
import { KeyringPair } from '@polkadot/keyring/types';
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './accountSelector';
import Balances from './balances';
import BlockNumber from './blockNumber';
import Events from './events';
import Interactor from './interactor';
import Metadata from './metadata';
import NodeInfo from './nodeInfo';
import TemplateModule from './templateModule';
import Transfer from './transfer';
import Upgrade from './upgrade';

const Main: FC = () => {
  const [accountAddress, setAccountAddress] = useState<string | Uint8Array>(
    null
  );
  const { apiState, keyring, keyringState, apiError } = useSubstrate();
  const accountPair: KeyringPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = (text: string) => (
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>
  );

  if (apiState === 'ERROR') {
    return (
      <Grid centered columns={2} padded>
        <Grid.Column>
          <Message
            negative
            compact
            floating
            header='Error Connecting to Substrate'
            content={`${JSON.stringify(apiError, null, 4)}`}
          />
        </Grid.Column>
      </Grid>
    );
  } else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef: React.RefObject<HTMLInputElement> = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>
      <Container>
        <Grid stackable columns='equal'>
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row stretched>
            <Balances />
          </Grid.Row>
          <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Upgrade accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
            <Interactor accountPair={accountPair} />
            <Events />
          </Grid.Row>
          <Grid.Row>
            <TemplateModule accountPair={accountPair} />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
};

const App: FC = () => {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
};

export default App;
