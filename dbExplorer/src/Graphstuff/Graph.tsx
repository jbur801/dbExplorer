// import {
//   AdjacentType,
//   DatastoreObjectType,
//   GetGetGraphTraversalRequest,
//   ValidBusinessObject,
// } from '@iotv/iotv-v3-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
// import AppDao from '../../../../../../../data/AppDao';
// import { NodeEdgeMapper } from '@iotv/datamodel-core';
// import IrrigatorIcons from '../../../Setup/EntityModels/IrrigatorAssets/IrrigatorIcons';
import Stack from '@mui/material/Stack';
import { Badge, Button, Checkbox, Drawer, FormControlLabel, Grid, Typography } from '@mui/material';
import {
//   customerIcon,
//   deviceIcon,
//   groupIcon,
//   irrigatorIcon,
//   programmeIcon,
//   propertyIcon,
  unknownIcon,
//   userIcon,
} from './icons';
// import { Avatar } from '@material-ui/core';
import { SelectedNodeDisplay } from './SelectedNodeDisplay';
import { GenericGraphControls } from './GraphControls';
import { select } from 'd3';

type forceGraphTestProps = {
  contextCustomer: any;
};

type nodeControls = {
  fetchDirectLinks: (types?: string[]) => void;
  showRelatedObsOnly: (yes: boolean) => void;
  removeObFromGraph: () => void;
  deleteObFromDb: () => void;
  // linkOb:()=>void,
  editObLinks: () => void;
};

const formatData = (data: any, filter: any) => {
  let sampleNodes = [{
    id:'1',
    name:'first',
    val:2,
    type:'Unknown',
    color:'black'
  },
  {
    id:'2',
    name:'second',
    val:2,
    type:'Unknown',
    color:'black'
  }
  ]
  let sampleEdges = [{ 
    source: '1',
    target: '2', 
    edgeTypeId: 'gadagadee'
   }
  ]


  if (filter) {
    sampleNodes = sampleNodes.filter((node) => filter[node.type] !== false);
    sampleEdges = sampleEdges.filter((edge) => {
      const [edgeTargetType, ...rest] = edge.target.split(':');
      const [edgeSrcType, ...rest2] = edge.source.split(':');

      return filter[edgeTargetType] !== false && filter[edgeSrcType] !== false;
    });
  }
  let nodeIds = sampleNodes.map((node) => node.id);
  for (let edge of sampleEdges) {
    if (!nodeIds.includes(edge.source)) {
      sampleNodes.push({ id: edge.source, name: 'NONEXISTENT NODE: ' + edge.source, val: 3, type: 'Unknown', color: 'red' });
      nodeIds.push(edge.source);
    }
    if (!nodeIds.includes(edge.target)) {
      sampleNodes.push({ id: edge.target, name: 'NONEXISTENT NODE: ' + edge.target, val: 3, color: 'red', type: 'Unknown' });
      nodeIds.push(edge.target);
    }
  }
  return { nodes: sampleNodes, links: sampleEdges };
};



// const formatNodeEdgeMapper = (mapper: NodeEdgeMapper, filter: any) => {
//   let nodes = mapper.getContainedItems().map((item: any) => {
//     return { id: item.pk, name: item.name || item.pk, val: 2, type: item.type || 'Unknown', color: 'black' };
//   });
//   let edges = mapper.getContainedEdges().map((edge) => {
//     const anyEdge: any = edge as any;
//     return { source: edge.pk, target: edge.sk, edgeTypeId: anyEdge.edgeTypeId };
//   });

//   if (filter) {
//     nodes = nodes.filter((node) => filter[node.type] !== false);
//     edges = edges.filter((edge) => {
//       const [edgeTargetType, ...rest] = edge.target.split(':');
//       const [edgeSrcType, ...rest2] = edge.source.split(':');

//       return filter[edgeTargetType] !== false && filter[edgeSrcType] !== false;
//     });
//   }

//   let nodeIds = nodes.map((node) => node.id);
//   for (let edge of edges) {
//     if (!nodeIds.includes(edge.source)) {
//       nodes.push({ id: edge.source, name: 'NONEXISTENT NODE: ' + edge.source, val: 3, type: 'Unknown', color: 'red' });
//       nodeIds.push(edge.source);
//     }
//     if (!nodeIds.includes(edge.target)) {
//       nodes.push({ id: edge.target, name: 'NONEXISTENT NODE: ' + edge.target, val: 3, color: 'red', type: 'Unknown' });
//       nodeIds.push(edge.target);
//     }
//   }
//   return { nodes: nodes, links: edges };
// };

const icons: { [k: string]: any } = {
  // Property: propertyIcon,
  // Irrigator: irrigatorIcon,
  // Device: deviceIcon,
  // Customer: customerIcon,
  // IrrigationZone: IrrigatorIcons.disabled,
  Unknown: unknownIcon,
  // User: userIcon,
  // IrrigationSequentialSchedule: programmeIcon,
  // Group: groupIcon,
};
interface attributesSelected {
  [key: string]: boolean;
}

export const DbExplorer = (props: forceGraphTestProps) => {
  const { contextCustomer } = props;
  // const [data, setData] = useState<any>(myData);
  const [height, setHeight] = useState<number>(600);
  const [width, setWidth] = useState<number>(600);
  const [noData,setNoData] = useState<boolean>(true);
  const [particles, setParticles] = useState<boolean>(true);
  const [textDisplayable, setTextDisplayable] = useState<boolean>(true);
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>();
  const [fetchedData, setFetchedData] = useState<any>({sample:'idk'});
  const [typeAllowedList, setTypeAllowedList] = useState<attributesSelected>({});

  const [directLinksOnly, setDirectLinksOnly] = useState<boolean>(false);

  // const [filter, setFilter] = useState<any>({ typeWhitelist: ['Irrigator', 'Customer', 'Property', 'Group'] });
  const fgRef = useRef();

  // const viewMapper = useMemo(() => {});

  const data = useMemo(() => {
    if (selectedNode && directLinksOnly) {
      // const viewableData = new NodeEdgeMapper();
      // const edges = [...mapper.getChildEdges(selectedNode), ...mapper.getParentEdges(selectedNode)];
      // const nodes = [...mapper.getChildNodes(selectedNode), ...mapper.getParentNodes(selectedNode)];
      //viewableData.loadItems([...edges, ...nodes, selectedNode]);
      const viewableData = {sample:'sample'}
      return formatData(viewableData, typeAllowedList);
    }
    return formatData(fetchedData, typeAllowedList);
  }, [fetchedData, typeAllowedList, selectedNode, directLinksOnly]);

  const div = useCallback((node: any) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const fetchDirectLinks = useMemo(() => {
    return (types?: string[]) => selectedNode && getData(selectedNode);
  }, [selectedNode]);

  const finalWidth: number = useMemo(() => {
    return showSideBar ? width - 300 : width - 70;
  }, [showSideBar, width]);

  useEffect(() => {
    setTextDisplayable(data.nodes.length < 50);
  }, [data]);

  const toggleAttribute = (attribute: string) => {
    if (typeAllowedList[attribute] === true) {
      typeAllowedList[attribute] = false;
    } else {
      typeAllowedList[attribute] = true;
    }
    setTypeAllowedList({ ...typeAllowedList });
  };
  const getData = async (something:any) => {
    // const getChildren: GetGetGraphTraversalRequest = {
    //   contextObjects: [contextObject],
    //   path: [{ objectTypeId: '*', adjacencyType: AdjacentType.CHILD }],
    // };
    // const getParents: GetGetGraphTraversalRequest = {
    //   contextObjects: [contextObject],
    //   path: [{ objectTypeId: '*', adjacencyType: AdjacentType.PARENT }],
    // };
    // const children = (await AppDao.queryByGraph(getChildren)).data || new NodeEdgeMapper();
    // const parents = (await AppDao.queryByGraph(getParents)).data || new NodeEdgeMapper();
    // const allData = new NodeEdgeMapper();
    // allData.loadItems(mapper.getContainedNodesAndEdges());
    // allData.loadItems(children.getContainedNodesAndEdges());
    // allData.loadItems(parents.getContainedNodesAndEdges());
    const allData = {sample:'sample'}
    setFetchedData(allData);
    setNoData(false);
  };
  // useEffect(() => {
  //   setMapper(new NodeEdgeMapper());
  // }, [contextCustomer]);

  useEffect(() => {
    if (contextCustomer && noData) {
      getData(contextCustomer);
    }
    setTypeAllowedList((typeAllowedList: any) => {
      // const newTypes = Object.keys(mapper.containedTypes()).reduce((mergedObject: any, type) => {
      //   mergedObject[type] = true;
      //   return mergedObject;
      // }, {});
      // return { ...newTypes, ...typeAllowedList };
      return {'Unknown':true}
    });
  }, [fetchedData]);

  function nodePaint(node: any, color: any, ctx: CanvasRenderingContext2D) {
    const { id, x, y } = node;
    color = node.color || color;
    if (selectedNode?.pk === id) {
      color = 'blue';
    }
    ctx.fillStyle = color;

    const type = node.type;
    const applicableIMG = icons[type] || icons.Unknown;
    const nodeText = node.name || node.id;
    const displayText = node.type !== 'Unknown' && textDisplayable;
    const drawImg = () => {
      const img = new Image(5, 5);
      img.src = applicableIMG;
      ctx.drawImage(img, x - 5, y - 5, 10, 10);
      if (displayText) {
        ctx.font = '5px Sans-Serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(nodeText, x, y + 10);
      }
    };

    const paint = drawImg;
    paint();
  }
  // gen a number persistent color from around the palette
  const getColor = (n: any) => '#' + ((n * 1234567) % Math.pow(2, 24)).toString(16).padStart(6, '0');

  const onLinkClick = useCallback(
    (node: any, event: MouseEvent) => {
      // Aim at node from outside it
      const distance = 40;
      // const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      (fgRef.current as any)?.centerAt(
        node.x,
        node.y, // new position

        300, // ms transition duration
      );
      // const nodeVBO = mapper
      //   .getChildEdges({ sk: node.source.id } as any)
      //   .find((edge) => edge.sk === node.target.id) as ValidBusinessObject;

      console.log(node.source);
      // // nodeVBO && getData(nodeVBO);
      // setSelectedNode(nodeVBO);
      // setShowSideBar(true);
    },
    [fgRef, fetchedData],
  );

  const handleClick = useCallback(
    (node: any, event: MouseEvent) => {
      // Aim at node from outside it
      const distance = 40;
      // const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      (fgRef.current as any)?.centerAt(
        node.x,
        node.y, // new position

        300, // ms transition duration
      );
      console.log((node.id))
      // const nodeVBO = mapper.getPrimaryItem(node.id) as ValidBusinessObject;
      // // nodeVBO && getData(nodeVBO);
      // setSelectedNode(nodeVBO);
      // setShowSideBar(true);
    },
    [fgRef,fetchedData],
  );

  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      // nodeVBO && getData(nodeVBO);
      setSelectedNode(undefined);

      // const popupPos = { x: event.clientX, y: event.clientY };
      // setPopup(popupPos);
    },
    [fgRef, fetchedData],
  );

  const graphControlFns = {
    setMapper: setFetchedData,
    setSelectedNode: setSelectedNode,
    toggleParticles: () => setParticles((particles: boolean) => !particles),
  };

  return (
    <>
      <Grid container>
        {Object.keys(typeAllowedList).map((attribute: string) => {
          return (
            <Grid
              item
              sm={3}
              sx={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={typeAllowedList[attribute]}
                    onChange={() => toggleAttribute(attribute)}
                  />
                }
                label={
                  <Stack direction={'row'}>
                    <Badge>
                      <img
                        src={icons[attribute] || icons.Unknown}
                        width={'20px'}
                        height={'25px'}
                      />
                    </Badge>
                    Display {attribute}s
                  </Stack>
                }
              />
            </Grid>
          );
        })}
        <Grid
          item
          sm={3}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Button
            onClick={() =>
              setTypeAllowedList((typeAllowedList) => {
                return Object.keys(typeAllowedList).reduce((mergedObject: any, type) => {
                  mergedObject[type] = false;
                  return mergedObject;
                }, {});
              })
            }
          >
            Deselect All
          </Button>
          {/* <Button
            onClick={() => {
              for (let ob of mapper.getContainedItems()) {
                getData(ob);
              }
            }}
          >
            DANGER DANGER DANGER
          </Button> */}
        </Grid>
      </Grid>
      <div
        ref={div}
        style={{ width: '99%', height: '100%', borderStyle: 'solid', margin: 5 }}
      >
        <Stack
          direction={'row'}
          // margin={1}
        >
          <ForceGraph2D
            width={finalWidth}
            height={height}
            graphData={data}
            ref={fgRef}
            linkCurvature={0}
            linkDirectionalArrowRelPos={1}
            linkAutoColorBy={'edgeTypeId'}
            linkDirectionalParticles={particles ? 2 : undefined}
            linkDirectionalArrowColor={'black'}
            linkDirectionalArrowLength={5}
            nodeCanvasObject={(node, ctx) => nodePaint(node, getColor(node.id), ctx)}
            // nodePointerAreaPaint={nodePaint}
            onLinkClick={onLinkClick}
            onNodeClick={handleClick}
            onBackgroundClick={handleCanvasClick}
          />
          {showSideBar ? (
            <div style={{ width: '300px', height: height, borderStyle: 'solid' }}>
              {selectedNode ? (
                <SelectedNodeDisplay
                  node={selectedNode}
                  mapper={fetchedData}
                  nodeControlBundle={{ setDirectLinksOnly, fetchDirectLinks, directLinksOnly }}
                />
              ) : (
                <GenericGraphControls
                  mapper={fetchedData}
                  selectedNode={selectedNode}
                  contextCustomer={contextCustomer}
                  graphControlFns={graphControlFns}
                />
              )}
            </div>
          ) : (
            <Button
              fullWidth
              onClick={() => setShowSideBar(true)}
            >
              menu
            </Button>
          )}
        </Stack>
      </div>
    </>
  );
};
