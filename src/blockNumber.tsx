import React, { FC, ReactPropTypes, useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

type BlockNumberType = {
  props?: ReactPropTypes;
  finalized?: boolean;
};

const Main: FC<BlockNumberType> = ({ finalized }) => {
  const { api } = useSubstrate();
  const [blockNumber, setBlockNumber] = useState(0);
  const [blockNumberTimer, setBlockNumberTimer] = useState(0);

  const bestNumber = finalized
    ? api.derive.chain.bestNumberFinalized
    : api.derive.chain.bestNumber;

  useEffect(() => {
    let unsubscribeAll = null;

    bestNumber(number => {
      setBlockNumber(number.toNumber());
      setBlockNumberTimer(0);
    })
      .then(unsub => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [bestNumber]);

  const timer = () => {
    setBlockNumberTimer(time => time + 1);
  };

  useEffect(() => {
    const id = setInterval(timer, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign='center'>
          <Statistic
            label={(finalized ? 'Finalized' : 'Current') + ' Block'}
            value={blockNumber}
          />
        </Card.Content>
        <Card.Content extra>
          <Icon name='time' /> {blockNumberTimer}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
};

const BlockNumber: FC<BlockNumberType> = props => {
  const { api } = useSubstrate();
  if (
    api.derive.chain &&
    api.derive.chain.bestNumber &&
    api.derive.chain.bestNumberFinalized
  ) {
    return <Main {...props} />;
  } else {
    return null;
  }
};

export default BlockNumber;
