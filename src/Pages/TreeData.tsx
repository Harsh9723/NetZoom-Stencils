import React, { useEffect, useState, Key, useCallback, useRef } from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import { Tabs, Tab, } from '@mui/material';
import axios from 'axios';
import { useTreeData } from '../Context/TreeDataContext';
import PropertyTable from '../Components/PropertyTable';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import SvgContent from '../Components/SvgContent';
import BASE_URL from '../Config/Config';
import { insertSvgContentIntoOffice } from '../Common/CommonFunctions';
import { Search, transformToRcTreeData } from '../Common/CommonFunctions';
import { TreeNodeProps } from 'rc-tree';
import { ReactSVG } from 'react-svg';

interface TreeNodeType {
  title: string;
  key: string;
  children?: TreeNodeType[];
  isLeaf?: boolean;
  EQID?:string,
  Description?:string,
  HasNetworkport?:boolean,
  HasPowerPorts?:boolean
  HasRelated?:boolean
  ShapeID?:number
  icon?:any,
}

interface TreeDataProps {
  treeData: TreeNodeType[];
}

interface PropertyItem {
  pName: string;
  pValue: string | number;
  pType: string | number;
  newValue: string;
}


const Treedata: React.FC<TreeDataProps> = ({ treeData: initialTreeData }) => {
  const {
    treeData,
    relatedTree,
    setRelatedTree,
    setTreeData,
    addLeafNode,
    addLeafNodeToRelatedTree,
  } = useTreeData();

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNodeType | any>([]);
  const [relatedExpandedKeys, setRelatedExpandedKeys] = useState<string[]>([]);
  const [relatedSelectedKeys, setRelatedSelectedKeys] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);
  const [relatedDevicesVisible, setRelatedDevicesVisible] = useState<boolean>(false);
  const [propertyData, setPropertyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [stencilResponse, setStencilResponse] = useState<string>('');
  const [Eqid, setEqId] = useState<string | string>('');
  const [shapeCounter, setShapeCounter] = useState<number>(0);
  const [productnumber, setProductNumber] = useState<string[]>([])
;
let getsessionId = sessionStorage.getItem("sessionID")

  const autoExpandDefaultNodesOfTree = async (treeData: TreeNodeType[]) => {
    let expKeys: any[] = [];
    let selKeys: any[] = [];
    let selNodes: any
    let isSelected = false;

    const expandAuto = async (nodes: TreeNodeType[]) => {
      for (let index = 0; index < nodes.length; index++) {
        const element = nodes[index];
        expKeys.push(element.key);

        if (element.children && element.children.length === 1) {
          isSelected = false
          await expandAuto(element.children);
        } else if (element.children && element.children.length > 1) {
          expKeys.push(element.key);
          selKeys.push(element.children[0].key);
          selNodes = element.children[0];
          isSelected = true;
          break;
        } else {
          selKeys.push(element.key);
          selNodes = element;
          break;
        }
      }
    };

    await expandAuto(treeData);
    return { expandedKeys: expKeys, selectedKeys: selKeys, selectedNode: selNodes, isSelected };
  };


  const switcherIcon: React.FC<TreeNodeProps> = ({ expanded, isLeaf, selected }) => {
    if (isLeaf) {
      return null;
    }

    const svgColor = selected ? 'black' : 'var(--font-color)'; 

    return expanded ? (
      <ReactSVG
        src="./assets/Icons/Down_128x128.svg"
        beforeInjection={(svg) => {
          svg.setAttribute('fill', svgColor);  
          svg.setAttribute('height', '16px'); 
          svg.setAttribute('width', '16px');  
        }}
      />
    ) : (
      <ReactSVG
        src="./assets/Icons/Down_128x128.svg"
        beforeInjection={(svg) => {
          svg.setAttribute('fill', svgColor);  
          svg.setAttribute('height', '16px');  
          svg.setAttribute('width', '16px');    
        }}
        style={{ transform: 'rotate(270deg)' }}
      />
    );
  };

  // fetch shape node based on eqid 
  const generateUniqueKey = () => {
    return `visio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

 

  //call api for get visio node and other property



  // fetch for stencil name on property table 

  


  //fetch related tab and and property table data
  const GetPropertyValue = useCallback (async (eqId: string) => {
    setIsLoading(true);
    try {
      const  libraryPropertyResponse = await
     
        axios.post(`${BASE_URL}get_properties_for_eqidlist`, {
          eqidList:[eqId],
          sessionId:getsessionId
        })
    
      const librarypropertywithskeloton = libraryPropertyResponse.data.data.deviceJson 
      let parse = JSON.parse(librarypropertywithskeloton)
      let property = parse.find((item:any) =>item.TableName === "Hardware")
      let parseProperty = JSON.parse(property.Properties      )
      console.log("property", parseProperty)  

  
      setPropertyData(parseProperty);
  
      // if (relatedDevice) {
      //   setRelatedDevicesVisible(true);
      // } else {
      //   setRelatedDevicesVisible(false);
      // }

    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  },[])
  

  const callApiForGetDevicePreview = async (shapeId: string) => {
    try {
      const response = await axios.post(`${BASE_URL}get_devicemodel_svg`, {
        sessionId:getsessionId,
        ShapeID: shapeId,
      });
      const parsesvg = JSON.parse(response.data.data.devicePreviewJson)
      setSvgContent(parsesvg);
      setPropertyData([])

      console.log('Device Preview Response:', response.data);
    } catch (error) {
      console.error('Error fetching device preview:', error);
    }
  };
  
  const setPropertyValuesFromXML = (
    librarypropertywithskeloton: PropertyItem[],
    PropertyXMLString: string
  ): void => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(PropertyXMLString, "text/xml");

      const updatedPropertyData = librarypropertywithskeloton.map((item) => {
        const propertyName = item.pName;
        const matchingElement = xmlDoc.querySelector(`Basic > ${propertyName}`);

        let newValue = matchingElement?.textContent?.trim() || item.pValue;

        // If the type is 'number', parse the value into a number
        if (item.pType === 'number') {
          const numericValue = parseFloat(newValue as string);
          newValue = isNaN(numericValue) ? item.pValue : numericValue;
        }

        return {
          ...item,
          pValue: newValue,
        };
      });

      setPropertyData(updatedPropertyData);
    } catch (error) {
      console.error('Error parsing XML or setting property values:', error);
    }
  };

  // function for manually expand tree(related tab tree)
  const handleExpandRelatedTree = async (relatedExpandedKeys: any, { node, expanded }: { node: any; expanded: boolean, nativeEvent: MouseEvent }) => {
    let newExpandedKeys = [...relatedExpandedKeys];

    if (!expanded) {
      newExpandedKeys = newExpandedKeys.filter(key => key !== node.key);
      setRelatedExpandedKeys(newExpandedKeys);
      setRelatedSelectedKeys([node.key]);

      if (!node.EQID) {
        setPropertyData([]);
        setSvgContent(null);
        setEqId('');
      }
      if (node.EQID) {
        await GetPropertyValue(node.EQID);
      }
      return;
    }

    const { expandedKeys: autoExpandedKeys, selectedKeys: autoSelectedKeys, selectedNode, isSelected } = await autoExpandDefaultNodesOfTree([node]);

    newExpandedKeys = Array.from(new Set([...newExpandedKeys, ...autoExpandedKeys]));
    setRelatedExpandedKeys(newExpandedKeys);

    if (autoSelectedKeys.length > 0) {
      setRelatedSelectedKeys(autoSelectedKeys);
    }

    if (selectedNode && selectedNode.EQID && isSelected === true) {
      setRelatedSelectedKeys(autoSelectedKeys);
      await GetPropertyValue(selectedNode.EQID);

    } else if (selectedNode && selectedNode.ShapeID) {
      await callApiForGetDevicePreview(selectedNode.ShapeID);
      setProductNumber(selectedNode.ProductNumber)

    }
  };

  // function for manually expand tree(result tab tree)
  const handleExpandMainTree = async (expandedKeys: any, { node, expanded, }: { node: any; expanded: boolean; nativeEvent: MouseEvent }) => {
    let newExpandedKeys = [...expandedKeys]
debugger
    const eqid = node.EQID;
    console.log('Expand/Collapse node:', eqid);

    if (!expanded) {
      newExpandedKeys = newExpandedKeys.filter(key => key !== node.key);
      setExpandedKeys(newExpandedKeys);
      setSelectedKeys([node.key]);
      setSelectedNode(node);
      setEqId('')
      if (!node.EQID) {
        setPropertyData([]);
        setSvgContent(null);
        setEqId('')
        setRelatedDevicesVisible(false);
      } else if (node.EQID) {
        await GetPropertyValue(node.EQID);
      } 
      
      if (node.HasRelated === true){
        setRelatedDevicesVisible(true)
        setEqId(node.EQID)
      }
      return;
    }

    const { expandedKeys: autoExpandedKeys, selectedKeys: autoSelectedKeys, selectedNode, isSelected } = await autoExpandDefaultNodesOfTree([node]);
    newExpandedKeys = Array.from(new Set([...newExpandedKeys, ...autoExpandedKeys]));
    setExpandedKeys(newExpandedKeys);

    if (autoSelectedKeys.length > 0) {
      setSelectedKeys(autoSelectedKeys);
      setSelectedNode(selectedNode);
    }
    if ( selectedNode.EQID && isSelected === true  ) {
      await GetPropertyValue(selectedNode.EQID);
      setSelectedKeys(autoSelectedKeys)
    } 
    else if (selectedNode.ShapeID) {
      await callApiForGetDevicePreview(selectedNode.ShapeID);
      setProductNumber(selectedNode.ProductNumber)

    }

  };

  
  useEffect(() =>{
    console.log("eqid",Eqid)
        },[Eqid])

  //logic of select treenode manually
  const handleSelectMainTree = async (selectedKeys: Key[], info: { event: "select"; selected: boolean; node: any; selectedNodes: any[]; nativeEvent: MouseEvent }) => {
    debugger
    if (tabValue !== 0) return;
    const selectedNode = info.node;
    console.log("selected node info", selectedNode);

    setSelectedKeys([selectedNode.key]);
    setSelectedNode(selectedNode);

    // if (selectedNode.key.includes('visio') && selectedNode.visioDownloadUrl) {
    //   selectedNode.onClick();
    //   return;
    // }

    if (selectedNode.ShapeID) {
      await callApiForGetDevicePreview(selectedNode.ShapeID);
      // setEqId(selectedNode.eqid);
      setRelatedDevicesVisible(false)
    } else if (selectedNode.EQID) {
      setSelectedKeys([selectedNode.key])
      await GetPropertyValue(selectedNode.EQID);
      // setSelectedNode([selectedNode])
    } 
    else if (!selectedNode.EQID && !selectedNode.ShapeID) {
      setPropertyData([]);
      setSvgContent(null);
      // setRelatedDevicesVisible(false);
    }

    if(selectedNode.HasRelated === true){
      setRelatedDevicesVisible(true)
      setEqId(selectedNode.EQID)
    }

  };

 

  

  const handleSelectRelatedTree = async (relatedSelectedKeys: Key[], info: { event: "select", selected: boolean; node: any, nativeEvent: MouseEvent }) => {
    if (tabValue !== 1) return;

    const selectedNodeRelated = info.node;
    console.log('relatedselected node info', selectedNodeRelated);

    setRelatedSelectedKeys([selectedNodeRelated.key]);

    if (selectedNodeRelated.key.toString().includes('visio') && selectedNodeRelated.visioDownloadUrl) {
      selectedNodeRelated.onClick();
      return;
    }

    if (selectedNodeRelated.EQID) {
      setRelatedSelectedKeys([selectedNodeRelated.key]);

      await GetPropertyValue(selectedNodeRelated.EQID);
    } else if (selectedNodeRelated.ShapeID) {
      await callApiForGetDevicePreview(selectedNodeRelated.ShapeID);
    } else if ( !selectedNodeRelated.EQID && !selectedNodeRelated.ShapeID) {
      setPropertyData([]);
      setSvgContent(null);
    }
    console.log('related selected node', relatedSelectedKeys);
  };


  const handleTabChange = async (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      setPropertyData([]);
      setSvgContent(null);
      setIsLoading(true);
      Search({ Eqid, related: true }, onRelatedSuccess, onerror);
      setIsLoading(false);
      setProductNumber([])
    }

    if (newValue === 0) {
      setSvgContent(null);
      setRelatedSelectedKeys([]);
      setSelectedKeys(selectedKeys);
      setSelectedNode(selectedNode)
      setExpandedKeys(expandedKeys);


      if (selectedNode) {
        if (selectedNode?.ShapeID) {
          await callApiForGetDevicePreview(selectedNode?.ShapeID);
        } else if (selectedNode?.EQID) {
          await GetPropertyValue(selectedNode?.EQID);
        }
      }
    }
  };

  const onRelatedSuccess = async (resultData: any) => {
    setIsLoading(true)
    try {
      const RelatedTree = transformToRcTreeData(resultData);
      console.log('Related Tree:', resultData);
      setRelatedTree(RelatedTree)
      const { expandedKeys, selectedKeys, selectedNode, isSelected } = await autoExpandDefaultNodesOfTree(RelatedTree);

      setRelatedExpandedKeys(expandedKeys);
      setRelatedSelectedKeys(selectedKeys);
    if (selectedNode.EQID && isSelected === true) {
        selectedNode(selectedNode.ProductNumber)
        GetPropertyValue(selectedNode.EQID)
        setRelatedSelectedKeys(selectedKeys);
      } else if (selectedNode.ShapeID){
        await callApiForGetDevicePreview(selectedNode.ShapeID)
        setProductNumber(selectedNode.ProductNumber)

      }
    } catch (error) {
      console.error('Error handling related tree data:', error);
    }
    setIsLoading(false)
  };
  const onerror = () => {
    console.log('related tree not found')
  }
  const handleDragStart = async (info: any) => {
    const { node } = info;
    console.log('Drag started on node:', node);

    try {
      const response = await axios.post(`${BASE_URL}get_devicemodel_svg`, {
        sessionId:getsessionId,
        ShapeID: node.ShapeID,
      });
      const parsesvg = JSON.parse(response.data.data.devicePreviewJson)
console.log(parsesvg)
      await insertSvgContentIntoOffice(parsesvg, 'drag', shapeCounter)
      setShapeCounter(shapeCounter + 1)
      return response;
    } catch (error) {
      console.error('API Error:', error);
    }
  };



useEffect(() => {
  if (initialTreeData) {
    setTreeData(initialTreeData);
    // Apply autoExpand on first-time tree render
    autoExpandDefaultNodesOfTree(initialTreeData).then(async ({ expandedKeys, selectedKeys, selectedNode, isSelected }) => {
      setExpandedKeys(expandedKeys);

        if (selectedNode.EQID && isSelected) {
        GetPropertyValue(selectedNode.EQID); 
        setSelectedKeys([selectedNode.key]);
        setSelectedNode(selectedNode);
      } else if(selectedNode.ShapeID){
        await callApiForGetDevicePreview(selectedNode.ShapeID)
        setSelectedKeys(selectedNode.ShapeID)
        setSelectedKeys([selectedNode.key]);
        setProductNumber(selectedNode.ProductNumber);
      }
      else {
        setSelectedKeys([selectedNode.key]);
        setSelectedNode(selectedNode);
      } 
    });

    console.log('initial treeData', initialTreeData);
  }
   // eslint-disable-next-line
},[initialTreeData, setTreeData]);


  return (
    <div className="tabs-container">
      <Backdrop
        className='backdrop'
        open={isLoading}>
        <CircularProgress className='circular-progress' />
      </Backdrop>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        TabIndicatorProps={{
          style: {
            display: 'none',
            color: 'var(--font-color)',
            height: '10px',
          },
        }}
        className="custom-tabs"
      >
        <Tab
          label="Result"
          disableRipple
          className="custom-tab"
        />
        {relatedDevicesVisible && (
          <Tab
            label="Related"
            disableRipple
            className="custom-tab-related"
          />
        )}
      </Tabs>

      {tabValue === 0 && (
        <>
          <Tree
            treeData={treeData}
            switcherIcon={switcherIcon}
            defaultExpandAll={false}
            showIcon={true}
            className="custom-rc-tree"
            expandedKeys={expandedKeys}
            onSelect={handleSelectMainTree}
            onExpand={handleExpandMainTree}
            selectedKeys={selectedKeys}
            draggable
            onDragStart={handleDragStart}
          />

          {propertyData && propertyData.length > 0 ? (
            <PropertyTable propertyData={propertyData} stencilResponse={stencilResponse} />
          ) : (
            svgContent && svgContent.length > 0 && <SvgContent svgContent={svgContent} productnumber={productnumber} />
          )}
        </>
      )}

      {tabValue === 1 && relatedDevicesVisible && (
        <>
          <Tree
            treeData={relatedTree}
            switcherIcon={switcherIcon}
            defaultExpandAll={false}
            showIcon={true}
            className="custom-rc-tree"
            expandedKeys={relatedExpandedKeys}
            selectedKeys={relatedSelectedKeys}
            draggable
            onSelect={handleSelectRelatedTree}
            onExpand={handleExpandRelatedTree}
            onDragStart={handleDragStart}
          />

          {(propertyData) && propertyData.length > 0 ? (
            <PropertyTable propertyData={propertyData} stencilResponse={stencilResponse} />
          ) : (
            svgContent && svgContent.length > 0 && <SvgContent svgContent={svgContent} productnumber={productnumber} />
          )}
        </>
      )}

    </div>

  );
};


export default Treedata;
