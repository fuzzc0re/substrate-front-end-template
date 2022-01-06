import React, { FC, useEffect, useState } from 'react';
import { Feed, Grid, Button } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

// Events to be filtered from feed
const FILTERED_EVENTS = [
  'system:ExtrinsicSuccess::(phase={"applyExtrinsic":0})'
];

const eventName = ev => `${ev.section}:${ev.method}`;
const eventParams = ev => JSON.stringify(ev.data);

const Main: FC<{ feedMaxHeight?: number }> = ({ feedMaxHeight = 250 }) => {
  const { api } = useSubstrate();
  const [eventFeed, setEventFeed] = useState([]);

  useEffect(() => {
    let unsub = null;
    let keyNum = 0;
    const allEvents = async () => {
      unsub = await api.query.system.events(events => {
        // loop through the Vec<EventRecord>
        events.forEach(record => {
          // extract the phase, event and the event types
          const { event, phase } = record;

          // show what we are busy with
          const evHuman = event.toHuman();
          const evName = eventName(evHuman);
          const evParams = eventParams(evHuman);
          const evNamePhase = `${evName}::(phase=${phase.toString()})`;

          if (FILTERED_EVENTS.includes(evNamePhase)) return;

          setEventFeed(e => [
            {
              key: keyNum,
              icon: 'bell',
              summary: evName,
              content: evParams
            },
            ...e
          ]);

          keyNum += 1;
        });
      });
    };

    allEvents();
    return () => unsub && unsub();
  }, [api.query.system]);

  return (
    <Grid.Column width={8}>
      <h1 style={{ float: 'left' }}>Events</h1>
      <Button
        basic
        circular
        size='mini'
        color='grey'
        floated='right'
        icon='erase'
        onClick={_ => setEventFeed([])}
      />
      <Feed
        style={{ clear: 'both', overflow: 'auto', maxHeight: feedMaxHeight }}
        events={eventFeed}
      />
    </Grid.Column>
  );
};

const Events: FC = props => {
  const { api } = useSubstrate();
  if (api.query && api.query.system && api.query.system.events) {
    return <Main {...props} />;
  } else {
    return null;
  }
};

export default Events;
