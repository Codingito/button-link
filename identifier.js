
import figmaData from "./figma.js";






function isButtonLinkComponent(figmaData) {
  const nodes = figmaData?.result?.nodes || figmaData?.Result?.nodes;
  if (!nodes) return false;

  const nodeEntries = Object.entries(nodes);
  if (nodeEntries.length === 0) return false;

  const [_, mainNodeData] = nodeEntries[0];
  const mainNode = mainNodeData.document;

  if (!mainNode || !Array.isArray(mainNode.children)) return false;

  const children = mainNode.children;

  const instanceNodes = children.filter(child => child.type === "INSTANCE");
  const textNodes = children.filter(child => child.type === "TEXT");

  const hasOneText = textNodes.length === 1;
  const hasOneOrTwoInstances = instanceNodes.length === 1 || instanceNodes.length === 2;

  const typeCheck =  Object.values(nodes).some(node => {
    const doc = node?.document;
    return doc?.type === "INSTANCE" && doc?.name === "Buttons/Link";
  });

  const textContentCheck = textNodes[0]?.characters?.trim().length > 0;

  const instanceNamesCheck = instanceNodes.every(inst =>
    typeof inst.name === "string" && /icon|clock/i.test(inst.name)
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



  const componentProperties = mainNodeData.document.componentProperties ;
    if (!componentProperties) return false;
    const leadingIconKey = Object.keys(componentProperties).find((k) =>
    k.includes("⬅️ Icon leading")
  );
  const trailingIconKey = Object.keys(componentProperties).find((k) =>
    k.includes("➡️ Icon trailing")
  );

  if (
    !leadingIconKey ||
    !trailingIconKey ||
    componentProperties[leadingIconKey].value !== true ||
    componentProperties[trailingIconKey].value !== true
  ) {
    return false;
  }
  return hasOneText && hasOneOrTwoInstances && textContentCheck && instanceNamesCheck && typeCheck;
}

if (isButtonLinkComponent(figmaData)) {
 
  console.log("Valid Component! Output:");
} else {
  console.log("This Figma component is not a button-link structure.");
}
