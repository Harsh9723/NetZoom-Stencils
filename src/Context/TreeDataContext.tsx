import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TreeNode {
  key: string;
  children?: TreeNode[];
  [key: string]: any; 
}

interface TreeDataContextType {
  treeData: TreeNode[];
  setTreeData: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  addLeafNode: (parentKey: string, ...newNodes: TreeNode[]) => void;
  setInitialTreeData: (data: TreeNode[]) => void;
  relatedTree: TreeNode[];
  setRelatedTree: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  addLeafNodeToRelatedTree: (parentKey: string, ...newNodes: TreeNode[]) => void;
  setInitialRelatedTreeData: (data: TreeNode[]) => void;
}

const TreeDataContext = createContext<TreeDataContextType | undefined>(undefined);

interface TreeDataProviderProps {
  children: ReactNode;
}

// The provider component
export const TreeDataProvider: React.FC<TreeDataProviderProps> = ({ children }) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [relatedTree, setRelatedTree] = useState<TreeNode[]>([]);
// add view node to parentnode on result tab tree
  const addLeafNode = (parentKey: string, ...newNodes: TreeNode[]) => {
    setTreeData((prevData) => {
      const addNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.key === parentKey) {
            const existingKeys = new Set((node.children || []).map((child) => child.key));
            const uniqueNewNodes = newNodes.filter((newNode) => !existingKeys.has(newNode.key));

            if (uniqueNewNodes.length > 0) {
              return {
                ...node,
                children: [
                  ...(node.children || []),
                  ...uniqueNewNodes,
                ],
              };
            }
            return node;
          } else if (node.children) {
            return {
              ...node,
              children: addNodes(node.children),
            };
          }
          return node;
        });
      };

      return addNodes(prevData);
    });
  };
//add node to parentnode on relaated tree 
  const addLeafNodeToRelatedTree = (parentKey: string, ...newNodes: TreeNode[]) => {
    setRelatedTree((prevData) => {
      const addNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.key === parentKey) {
            const existingKeys = new Set((node.children || []).map((child) => child.key));
            const uniqueNewNodes = newNodes.filter((newNode) => !existingKeys.has(newNode.key));

            if (uniqueNewNodes.length > 0) {
              return {
                ...node,
                children: [
                  ...(node.children || []),
                  ...uniqueNewNodes,
                ],
              };
            }
            return node;
          } else if (node.children) {
            return {
              ...node,
              children: addNodes(node.children),
            };
          }
          return node;
        });
      };

      return addNodes(prevData);
    });
  };

  const setInitialTreeData = (data: TreeNode[]) => {
    setTreeData(data);
  };

  const setInitialRelatedTreeData = (data: TreeNode[]) => {
    setRelatedTree(data);
  };

  return (
    <TreeDataContext.Provider value={{
      treeData,
      setTreeData,
      addLeafNode,
      setInitialTreeData,
      relatedTree,
      setRelatedTree,
      addLeafNodeToRelatedTree,
      setInitialRelatedTreeData,
    }}>
      {children}
    </TreeDataContext.Provider>
  );
};

// Custom hook to use the TreeDataContext
export const useTreeData = (): TreeDataContextType => {
  const context = useContext(TreeDataContext);
  if (!context) {
    throw new Error('useTreeData must be used within a TreeDataProvider');
  }
  return context;
};
