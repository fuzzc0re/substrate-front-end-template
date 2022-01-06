import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Menu, Button, Dropdown, Container, Icon, Image, Label } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

type AccountSelectorType = {
  setAccountAddress: Dispatch<SetStateAction<string | Uint8Array>>;
};

const Main: FC<AccountSelectorType> = ({ setAccountAddress }) => {
  const { keyring } = useSubstrate();
  const [accountSelected, setAccountSelected] = useState('');

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    // Don't know how to add name.toUpperCase() for unknown
    text: account.meta.name,
    icon: 'user'
  }));

  const initialAddress = keyringOptions.length > 0 ? keyringOptions[0].value : '';

  // Set the initial address
  useEffect(() => {
    setAccountAddress(initialAddress);
    setAccountSelected(initialAddress);
  }, [setAccountAddress, initialAddress]);

  const onChange = address => {
    // Update state with new account address
    setAccountAddress(address);
    setAccountSelected(address);
  };

  const AddAccountWithPolkadotExtension: FC = () => {
    if (!accountSelected) {
      return (
        <span>
          Add your account with the{' '}
          <a target='_blank' rel='noopener noreferrer' href='https://github.com/polkadot-js/extension'>
            Polkadot JS Extension
          </a>
        </span>
      );
    } else return null;
  };

  return (
    <Menu
      attached='top'
      tabular
      style={{
        backgroundColor: '#fff',
        borderColor: '#fff',
        paddingTop: '1em',
        paddingBottom: '1em'
      }}
    >
      <Container>
        <Menu.Menu>
          <Image src={`${process.env.PUBLIC_URL}/assets/substrate-logo.png`} size='mini' />
        </Menu.Menu>
        <Menu.Menu position='right' style={{ alignItems: 'center' }}>
          <AddAccountWithPolkadotExtension />
          <CopyToClipboard text={accountSelected}>
            <Button basic circular size='large' icon='user' color={accountSelected ? 'green' : 'red'} />
          </CopyToClipboard>
          <Dropdown
            search
            selection
            clearable
            placeholder='Select an account'
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={accountSelected}
          />
          <BalanceAnnotation accountSelected={accountSelected} />
        </Menu.Menu>
      </Container>
    </Menu>
  );
};

const BalanceAnnotation: FC<{ accountSelected: any }> = ({ accountSelected }) => {
  const { api } = useSubstrate();
  const [accountBalance, setAccountBalance] = useState(0);

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe;

    // If the user has selected an address, create a new subscription
    accountSelected &&
      api.query.system
        .account(accountSelected, balance => {
          setAccountBalance(balance.data.free.toHuman());
        })
        .then(unsub => {
          unsubscribe = unsub;
        })
        .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, accountSelected]);

  if (accountSelected) {
    return (
      <Label pointing='left'>
        <Icon name='money' color='green' />
        {accountBalance}
      </Label>
    );
  } else {
    return null;
  }
};

const AccountSelector: FC<AccountSelectorType> = props => {
  const { api, keyring } = useSubstrate();
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
};

export default AccountSelector;
