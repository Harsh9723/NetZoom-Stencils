import BASE_URL from "../Config/Config";
import axios from "axios";

export const insertSvgContentIntoOffice = async (
  svgContent: string,
  insertType: string,
  shapeCounter: number
): Promise<void> => {
  try {
    let left = 50 + 20 * shapeCounter;
    let top = 50;

    if (left > 400) {
      const extraY = Math.floor(left / 400);
      left = 50 + 20 * (shapeCounter - 18);
      top = 50 + 20 * extraY;
    }

    const options = {
      coercionType: Office.CoercionType.XmlSvg,
      imageLeft: left,
      imageTop: top,
    };

    await Office.context.document.setSelectedDataAsync(svgContent, {
      ...options,
      asyncContext: { insertType },
    });

    console.log(`SVG inserted via ${insertType} at position (left: ${left}, top: ${top})`);
  } catch (error) {
    console.error(`Error during ${insertType}:`, error);
  }
};

const API_URL = `${BASE_URL}`;

interface SearchParams {
  keyword?: string;
  kwdSearchType?: string;
  related?: boolean;
  Eqid?: string;
  selectedManufacturer?: string;
  setSnackbarMessage?: (message: string) => void;
  setSnackbarOpen?: (open: boolean) => void;
  selectedEqType?: string;
  selectedProductLine?: string;
  selectedProductNumber?: string;
  selectedDtManufacturers?: string[];
  selectedManufacturerDetails?:string[]
}

type OnSuccess = (resultData: any[]) => void;
type OnError = (message: string) => void;

/**
 * Performs a search using the provided search parameters.
 * @param searchParams - Parameters for the search function
 * @param onSuccess - Callback function for successful API call
 * @param onError - Callback function for error in API call
 */
export const Search = async (
  searchParams: SearchParams,
  onSuccess: OnSuccess,
  onError: OnError
): Promise<void> => {
  const {
    keyword,
    kwdSearchType,
    related,
    Eqid,
    selectedEqType,
    selectedProductLine,
    selectedProductNumber,
    selectedManufacturerDetails,
    selectedDtManufacturers = [],
  } = searchParams;

  let sessionId = sessionStorage.getItem("sessionID")
  if(!Eqid){

  try {
    const response = await axios.post(`${API_URL}get_filtered_devices`, {
      customerID: 0,
      customerName: '',
      iMaxResultCount: 0,
      orderByClause: "",
      searchAllWord: true,
      searchKeyWord: keyword,
      selectedEqType: selectedEqType,
      selectedMfg: selectedManufacturerDetails,
      selectedMfgEqType: "",
      selectedMfgProdNo: selectedProductNumber, 
      sessionId: sessionId


    });

    const searchData = response.data.data.deviceJson    
    const parse = JSON.parse(searchData)
    console.log("treedata", parse)
    const dtResultdata = searchData?.dtManufacturers || [];

 

    if (searchData.length > 0 ) {
      onSuccess(searchData);
    } else {
      console.log('No relevant data found');
      onError('No results found');

    }
  } catch (error: any) {
    console.error('Related not shown:', error.message);
    onError('An error occurred while fetching data');
  }
} else if(Eqid){
  try {
    const response = await axios.post(`${API_URL}get_related_for_filtered_device`,{
      customerID: 0,
      customerName: "",
      eqid: Eqid,
      sessionId: sessionId
        })
    const relatedData = response.data.data.deviceJson
      if(relatedData.length >0){
        onSuccess(relatedData)
      }else{
        console.log("related treedata not found")
      onError("No results found for related treedata")  
      }
    
  } catch (error) {
 
  }
  
}
};







/**
 * Transforms search results into a tree data structure.
 * @param result - The search results to transform.
 * @returns The transformed tree data.
 */


interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  EQID?:string,
  Description?:string,
  HasNetworkport?:boolean,
  HasPowerPorts?:boolean
  HasRelated?:boolean
  ShapeID?:number
  icon?:any,
  ProductNumber?:any

}
  
export const transformToRcTreeData = (data: any): TreeNode[] => {
  const treeData: TreeNode[] = [];
  
  let parseddata = JSON.parse(data);
  // Add the root node titled "Search Result"
  const rootNode: TreeNode = {
    title: "Search Result",
    key: "root",
    icon: (
      <img
        src="./assets/Icons/main_node.png"
        alt="Search Results Icon"
        style={{ width: 16, height: 16 }}
      />
    ),
    children: treeData
  };

  if (parseddata?.Manufacturer) {
    for (let manufacturer of parseddata.Manufacturer) {
      let manufacturerNode: TreeNode = {
        title: manufacturer.Name,
        key: `manufacturer-${manufacturer.Name}`,
        icon: (
          <img
            src="./assets/Icons/manufacturer.png"
            alt="manufacturer"
            style={{ width: 16, height: 16 }}
          />
        ),
        children: []
      };

      if (manufacturer.EQType) {
        for (let eqType of manufacturer.EQType) {
          let eqTypeNode: TreeNode = {
            title: eqType.Name,
            key: `eqType-${eqType.Name}`,
            icon: (
              <img
                src={`./assets/EqType/${eqType.Name}.png`}
                alt="EQTYPE"
                style={{ width: 16, height: 16 }}
              />
            ),
            children: []
          };

          if (eqType.ProductNumber) {
            for (let product of eqType.ProductNumber) {
              let productNode: TreeNode = {
                title: product.Name,
                key: `${product.EQID}`,
                EQID: product.EQID,
                Description: product.Description,
                HasNetworkport: product.HasNetworkPorts,
                HasPowerPorts: product.HasPowerPorts,
                HasRelated: product.HasRelated,
                icon: (
                  <img
                    src="./assets/Icons/product_no.gif"
                    style={{ width: 16, height: 16 }}
                    alt="Product Number"
                  />
                ),
                children: []
              };

              if (product.Views) {
                for (let view of product.Views) {
                  let viewNode: TreeNode = {
                    title: view.Name,
                    key: `view-${view.ShapeID}`,
                    isLeaf: true,
                    ShapeID: view.ShapeID,
                    ProductNumber: product.Name,
                    icon: view.Name.toLowerCase().includes('front') ? (
                      <img src="./assets/Icons/Front.png" alt="Front icon" />
                    ) : view.Name.toLowerCase().includes('rear') ? (
                      <img src="./assets/Icons/Rear.png" alt="Rear icon" />
                    ) : view.Name.toLowerCase().includes('top') ? (
                      <img src="./assets/Icons/TopView.png" alt="Top Icon" />
                    ) : null,
                  };
                  productNode.children?.push(viewNode);
                }
              }

              eqTypeNode.children?.push(productNode);
            }
          }

          manufacturerNode.children?.push(eqTypeNode);
        }
      }

      treeData.push(manufacturerNode);
    }
  }

  return [rootNode];

};


  



