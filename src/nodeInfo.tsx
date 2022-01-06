import React, { FC, useEffect, useState } from 'react';
import { Card, Icon, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

const Main: FC = props => {
  const { api, socket } = useSubstrate();
  const [nodeInfo, setNodeInfo] = useState<any>({});

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version()
        ]);
        setNodeInfo({ chain, nodeName, nodeVersion });
      } catch (e) {
        console.error(e);
      }
    };
    getInfo();
  }, [api.rpc.system]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>{nodeInfo.nodeName}</Card.Header>
          <Card.Meta>
            <span>{nodeInfo.chain}</span>
          </Card.Meta>
          <Card.Description>{socket}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name='setting' />v{nodeInfo.nodeVersion}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
};

const NodeInfo: FC = props => {
  const { api } = useSubstrate();
  if (
    api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version
  ) {
    return <Main {...props} />;
  } else {
    return null;
  }
};

export default NodeInfo;
