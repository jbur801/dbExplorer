// import { any } from '@iotv/iotv-v3-types';
// import { any } from '@iotv/datamodel-core';
import { Button, Stack } from '@mui/material';

export interface NodeControlStuffs {
  setDirectLinksOnly: (directLinksOnly: boolean) => void;
  fetchDirectLinks: (types?: string[]) => void;
  directLinksOnly: boolean;
}

interface ControlFromNodeProps {
  node: any;
  mapper: any;
  nodeControlBundle: NodeControlStuffs;
}

export const ControlFromNode = (props: ControlFromNodeProps) => {
  const { node, mapper, nodeControlBundle } = props;
  const { setDirectLinksOnly, fetchDirectLinks, directLinksOnly } = nodeControlBundle;
  return (
    <Stack>
      <Button onClick={() => setDirectLinksOnly(!directLinksOnly)}> Hide Unrelated Objects</Button>
      <Button onClick={() => fetchDirectLinks()}> Fetch Related Obs</Button>
    </Stack>
  );
};
// export const a = 'a'