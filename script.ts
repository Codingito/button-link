import * as fs from 'node:fs';
import fetch from 'node-fetch';

// Interface for mappings
interface ColorStyles {
  color: string;
  hoverColor: string;
  activeColor: string;
}

interface FigmaNode {
  name?: string;
  type?: string;
  children?: FigmaNode[];
  componentProperties?: Record<string, { value: string }>;
  componentPropertyReferences?: Record<string, string>;
  characters?: string;
  style?: any;
  styleOverrideTable?: any;
  characterStyleOverrides?: number[];
  boundVariables?: {
    fills?: { id: string }[];
  };
}

interface FigmaJson {
  Result?: {
    nodes: Record<string, { document: FigmaNode; componentSets?: Record<string, { name: string }> }>;
  };
  result?: {
    nodes: Record<string, { document: FigmaNode; componentSets?: Record<string, { name: string }> }>;
  };
}
//Transformer Fn:
class FigmaToLowcodeTransformer {
  sizeMapping: Record<string, string>;
  hierarchyMapping: Record<string, string>;
  iconMapping: Record<string, string>;
  colorVariableMapping: Record<string, ColorStyles>;

  constructor() {
    this.sizeMapping = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
    this.hierarchyMapping = { Primary: 'brand', Secondary: 'neutral', Destructive: 'error' };
    this.iconMapping = { clock: 'SvgRadioSelect', placeholder: 'SvgRadioSelect' };
    this.colorVariableMapping = {
      'VariableID:13119001a2cb3bf4ec2b3be8271d31bb940fa096/37457:7': {
        color: 'text-brand-tertiary',
        hoverColor: 'hover:text-brand-secondary',
        activeColor: 'active:text-brand-secondary'
      }
    };
  }

  transform(figmaJson: FigmaJson, componentId: string = this.generateId()) {
    const figmaNode = this.extractFigmaNode(figmaJson);
    if (!figmaNode) throw new Error('Invalid Figma JSON structure');

    const componentProps = figmaNode.componentProperties || {};
    const textContent = this.extractTextContent(figmaNode);
    const icons = this.extractIcons(figmaNode);
    const colorInfo = this.extractColorInfo(figmaNode);
    const url = this.extractUrlInfo(figmaNode);

    return {
      [componentId]: {
        component: {
          componentType: this.mapComponentType(figmaNode.name),
          appearance: {
            startDecorator: icons.leading || null,
            color: this.mapHierarchyToColor(componentProps.Hierarchy?.value),
            underline: "hover",
            endDecorator: icons.trailing || null,
            variant: this.mapSizeToVariant(componentProps.Size?.value),
            disabled: this.mapStateToDisabled(componentProps.State?.value),
            styles: colorInfo
          },
          content: {
            label: textContent,
            ...(url && { url })
          }
        },
        visibility: { value: true },
        dpOn: [],
        displayName: this.generateDisplayName(figmaNode.name),
        dataSourceIds: [],
        id: componentId,
        parentId: "b_uClzo"
      }
    };
  }

  extractFigmaNode(json: FigmaJson): FigmaNode | null {
    const nodes = json.Result?.nodes;
    return nodes ? nodes[Object.keys(nodes)[0]].document : null;
  }

  findNodeByType(node: FigmaNode, type: string): FigmaNode | null {
    if (node.type === type) return node;
    return node.children?.reduce((found, child) => found || this.findNodeByType(child, type), null) || null;
  }

  extractTextContent(node: FigmaNode): string {
    return this.findNodeByType(node, 'TEXT')?.characters || 'Button CTA';
  }

  extractIcons(node: FigmaNode): { leading: string | null; trailing: string | null } {
    const props = node.componentProperties || {};
    if (props.State?.value === 'Loading') return { leading: 'NoCodeLoader', trailing: null };

    const result = { leading: null, trailing: null };
    node.children?.forEach(child => {
      if (child.type === 'INSTANCE' && child.componentPropertyReferences) {
        const refs = child.componentPropertyReferences;
        if (refs.visible === '⬅️ Icon leading#3287:1577') result.leading = this.iconMapping[child.name!] || child.name!;
        if (refs.visible === '➡️ Icon trailing#3287:2338') result.trailing = this.iconMapping[child.name!] || child.name!;
      }
    });
    return result;
  }

  extractColorInfo(node: FigmaNode): ColorStyles {
    const text = this.findNodeByType(node, 'TEXT');
    const id = text?.boundVariables?.fills?.[0]?.id;
    return this.colorVariableMapping[id!] || {
      color: "text-brand-tertiary",
      activeColor: "active:text-brand-secondary",
      hoverColor: "hover:text-brand-secondary"
    };
  }

  extractUrlInfo(node: FigmaNode): string | null {
    const text = this.findNodeByType(node, 'TEXT');
    if (!text) return null;

    const allStyles = { ...text.styleOverrideTable };
    if (text.characterStyleOverrides?.length) {
      allStyles[text.characterStyleOverrides[0]] = allStyles[text.characterStyleOverrides[0]];
    }

    const hyperlinks = [text.style, ...Object.values(allStyles)]
      .filter(s => s?.hyperlink?.url)
      .map(s => s.hyperlink.url);

    return hyperlinks[0] || null;
  }

  mapComponentType(name?: string): string {
    return name?.toLowerCase().includes('link') ? 'Link' : 'Button';
  }

  mapSizeToVariant(size?: string): string {
    return this.sizeMapping[size || ''] || 'text-sm';
  }

  mapHierarchyToColor(hierarchy?: string): string {
    return this.hierarchyMapping[hierarchy || ''] || 'brand';
  }

  mapStateToDisabled(state?: string): boolean {
    return state === 'Disabled';
  }

  generateDisplayName(name?: string): string {
    return `${(name || 'Component').replace(/[\/\s]/g, '_')}_${Math.floor(Math.random() * 1000)}`;
  }

  generateId(): string {
    return 'b_' + Math.random().toString(36).slice(2, 7);
  }

  transformBatch(components: FigmaJson[]): Record<string, any> {
    return components.reduce((acc, json) => {
      const id = this.generateId();
      Object.assign(acc, this.transform(json, id));
      return acc;
    }, {});
  }

  addCustomMapping(type: 'size' | 'hierarchy' | 'icon' | 'color', key: string, value: any): void {
    const map: any = {
      size: this.sizeMapping,
      hierarchy: this.hierarchyMapping,
      icon: this.iconMapping,
      color: this.colorVariableMapping
    };
    if (map[type]) map[type][key] = value;
  }
}

async function fetchFigmaJson(fileUrl: string): Promise<FigmaJson> {
  const response = await fetch('https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma data: ${response.statusText}`);
  }

  return response.json();
}

const transformer = new FigmaToLowcodeTransformer();


//Identifier fn:
function isButtonLinkComponent(figmaData: FigmaJson): boolean {
  const nodes = figmaData?.result?.nodes || figmaData?.Result?.nodes;
  if (!nodes) return false;

  const [_, mainNodeData] = Object.entries(nodes)[0];
  const mainNode = mainNodeData.document;
  const children = mainNode.children || [];

  const instanceNodes = children.filter(child => child.type === "INSTANCE");
  const compNodes = children.filter(child => child.type === "COMPONENT");
  const textNodes = children.filter(child => child.type === "TEXT");

  const firstNodeWithComponentSets = Object.values(nodes).find(
    node => node.componentSets && typeof node.componentSets === "object"
  );

  const firstComponentSetName = firstNodeWithComponentSets
    ? Object.values(firstNodeWithComponentSets.componentSets!)[0]?.name
    : null;

  const isButtonsLink = firstComponentSetName === "Buttons/Link";
  const textContentCheck = textNodes[0]?.characters?.trim().length > 0;

  const instanceNamesCheck = instanceNodes.every(inst =>
    typeof inst.name === "string" && /(icon|clock|Dot|Loading)/i.test(inst.name)
  );

  const compCheck = compNodes.every(inst =>
    typeof inst.name === "string" && /(icon|clock|Dot|Loading)/i.test(inst.name)
  );

  return isButtonsLink && (instanceNamesCheck || compCheck);
}

async function transformFigmaFromUrl(fileUrl: string) {
  try {
    const figmaJson = await fetchFigmaJson(fileUrl);

    if (isButtonLinkComponent(figmaJson)) {
      const result = transformer.transform(figmaJson, 'b_CHVXi');
      fs.writeFileSync('no-code.json', JSON.stringify(result, null, 2), 'utf-8');
      console.log('Transformed component saved to no-code.json');
    } else {
      console.log("Not a button link component");
    }
  } catch (error) {
    console.error('Transformation failed:', error);
  }
}

const fileUrl = "https://www.figma.com/design/4r7C2sI9cktH4T8atJhmrW/Component-Sheet?node-id=1-5856&t=WXFqG3eV38cOh5qT-4";
transformFigmaFromUrl(fileUrl);
