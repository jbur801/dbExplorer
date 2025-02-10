
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Stack, Tab, Typography } from '@mui/material';
// import { JsonViewer } from '@textea/json-viewer';

import { useState } from 'react';
import { ControlFromNode, NodeControlStuffs } from './ControlFromNode';

interface NodeDisplayProps {
  node: any;
  mapper: any;
  nodeControlBundle: NodeControlStuffs;
}

export const SelectedNodeDisplay = (props: NodeDisplayProps) => {
  const { node, mapper, nodeControlBundle } = props;
  const [value, setValue] = useState<string>('controls');

  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', overflow: 'none', height: '100%' }}>
        <Stack direction={'row'}>
          <Typography>{node.pk !== node.sk ? `Edge ${node.pk}-${node.sk}` : `${node.type} ${node.name}`}</Typography>
          {/* <Button onClick={() => setShowSideBar(false)}>x</Button> */}
        </Stack>
        <TabList
          variant="fullWidth"
          onChange={(e: React.SyntheticEvent, newValue: string) => setValue(newValue)}
        >
          <Tab
            label={'Controls'}
            value={'controls'}
          />
          <Tab
            label={'Node Details'}
            value={'details'}
          />
          <Tab
            label={'JSON View'}
            value={'json'}
          />
        </TabList>

        <TabPanel
          value="json"
          sx={{ height: '100%' }}
        >
          {/* <JsonViewer {...{ value: props.node }} /> */}
        </TabPanel>
        <TabPanel
          value="controls"
          sx={{ height: '100%' }}
        >
          <ControlFromNode
            node={node}
            mapper={mapper}
            nodeControlBundle={nodeControlBundle}
          />
        </TabPanel>
        <TabPanel
          value="details"
          sx={{ height: '100%' }}
        >
          {/* <JsonViewer {...{ value: props.node }} /> */}
        </TabPanel>
      </Box>
    </TabContext>
  );
};
