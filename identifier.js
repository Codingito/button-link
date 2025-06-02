
import figmaData from "./figma.js"

function isButtonLinkComponent(figmaData) {
  const nodes = figmaData?.result?.nodes || figmaData?.Result?.nodes;
  if (!nodes) return false;

  const nodeEntries = Object.entries(nodes);
  

  const [_, mainNodeData] = nodeEntries[0];
  const mainNode = mainNodeData.document;
 


  const children = mainNode.children;

  const instanceNodes = children.filter(child => child.type === "INSTANCE");
  const compNodes = children.filter(child => child.type === "COMPONENT");

  const textNodes = children.filter(child => child.type === "TEXT");




const firstNodeWithComponentSets = Object.values(nodes).find(
  node => node.componentSets && typeof node.componentSets === "object"
);


const firstComponentSetName = firstNodeWithComponentSets
  ? Object.values(firstNodeWithComponentSets.componentSets)?.[0]?.name
  : null;

const isButtonsLink = firstComponentSetName === "Buttons/Link";
console.log(isButtonsLink);

  

  const textContentCheck = textNodes[0]?.characters?.trim().length > 0;

  const instanceNamesCheck = instanceNodes.every(inst =>
  typeof inst.name === "string" && /(icon|clock|Dot|Loading)/i.test(inst.name)
);

    const compCheck = compNodes.every(inst =>
  typeof inst.name === "string" && /(icon|clock|Dot|Loading)/i.test(inst.name)
);

//   const doc = mainNodeData.document;                             
//   const boundVars = doc?.boundVariables || {};
//     const hasTrailingIcon = boundVars.iconTrailing?.value === true;
//     const hasLeadingIcon = boundVars.iconLeading?.value === true;
//     if (!hasTrailingIcon || !hasLeadingIcon) return false;

//     // Check children
//     const child = doc?.children || [];
//     const vectorClocks = child.filter(c =>
//       c.type === "VECTOR" && c.name === "clock"
//     );

  return isButtonsLink &&(instanceNamesCheck || compCheck) ;
}

if (isButtonLinkComponent(figmaData)) {
 
  console.log("Valid Component! ");
} else {
  console.log("This Figma component is not a button-link structure.");
}
