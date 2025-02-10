
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Stack, Tab, Typography } from '@mui/material';
// import { JsonViewer } from '@textea/json-viewer';
// import { NodeEdgeMapper } from '@iotv/datamodel-core';
import { useState } from 'react';
// import { ControlFromNode } from './ControlFromNode';

export interface GraphControlFns {
  setSelectedNode: (node: any) => void;
  setMapper: (mapper: any) => void;
  toggleParticles: () => void;
}

interface GraphControlProps {
  selectedNode?: any;
  mapper: any;
  contextCustomer?: any;
  graphControlFns: GraphControlFns;
}

export const GenericGraphControls = (props: GraphControlProps) => {
  const { selectedNode, mapper, graphControlFns, contextCustomer } = props;
  const { toggleParticles, setMapper } = graphControlFns;
  const [value, setValue] = useState<string>('controls');

  const addContextCustomer = () => {
    if (!contextCustomer) return;

    // const newMap = new NodeEdgeMapper();
    // newMap.loadItems(mapper.getContainedNodesAndEdges());
    // newMap.loadItem(contextCustomer);
    // setMapper(newMap);
  };

  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList
          variant="fullWidth"
          onChange={(e: React.SyntheticEvent, newValue: string) => setValue(newValue)}
        >
          <Tab
            label={'Controls'}
            value={'controls'}
          />
          <Tab
            label={'Search'}
            value={'search'}
          />
          <Tab
            label={'JSON View'}
            value={'json'}
          />
        </TabList>
        <TabPanel
          value="controls"
          sx={{ height: '100%' }}
        >
          <Stack>
            <Button onClick={toggleParticles}> Toggle Particles</Button>
            <Button onClick={() => setMapper(undefined)}> Clear Graph</Button>
            <Button onClick={addContextCustomer}> Add Context Customer</Button>
          </Stack>
        </TabPanel>

        <TabPanel
          value="json"
          sx={{ height: '100%' }}
        >
          {/* <JsonViewer {...{ value: mapper.getContainedNodesAndEdges() }} /> */}
        </TabPanel>

        <TabPanel
          value="search"
          sx={{ height: '100%' }}
        >
          {/* <JsonViewer {...{ value: props.node }} /> */}
        </TabPanel>
      </Box>
    </TabContext>
  );
};
