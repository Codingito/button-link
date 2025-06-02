/**
 * Figma to Low-code Component Transformer
 * Transforms Figma JSON structure to low-code component JSON
 */

import figmaData from "./figmaButton.js";

// Type definitions for Figma JSON structure
interface FigmaHyperlink {
  url: string;
}

interface FigmaStyle {
  hyperlink?: FigmaHyperlink;
}

interface FigmaBoundVariable {
  id: string;
}

interface FigmaBoundVariables {
  fills?: FigmaBoundVariable[];
}

interface FigmaComponentPropertyReference {
  visible?: string;
}

interface FigmaComponentProperty {
  value: string;
}

interface FigmaComponentProperties {
  Size?: FigmaComponentProperty;
  Hierarchy?: FigmaComponentProperty;
  State?: FigmaComponentProperty;
}

interface FigmaNode {
  type: string;
  name?: string;
  characters?: string;
  children?: FigmaNode[];
  componentProperties?: FigmaComponentProperties;
  componentPropertyReferences?: FigmaComponentPropertyReference;
  boundVariables?: FigmaBoundVariables;
  style?: FigmaStyle;
  styleOverrideTable?: Record<string, FigmaStyle>;
  characterStyleOverrides?: number[];
}

interface FigmaDocument {
  document: FigmaNode;
}

interface FigmaResult {
  nodes: Record<string, FigmaDocument>;
}

interface FigmaJson {
  Result?: FigmaResult;
}

// Type definitions for low-code component structure
interface ColorInfo {
  color: string;
  hoverColor: string;
  activeColor: string;
}

interface Icons {
  leading: string | null;
  trailing: string | null;
}

interface ComponentAppearance {
  startDecorator: string | null;
  color: string;
  underline: string;
  endDecorator: string | null;
  variant: string;
  disabled: boolean;
  styles: ColorInfo;
}

interface ComponentContent {
  label: string;
  url?: string;
}

interface ComponentDefinition {
  componentType: string;
  appearance: ComponentAppearance;
  content: ComponentContent;
}

interface ComponentVisibility {
  value: boolean;
}

interface LowcodeComponent {
  component: ComponentDefinition;
  visibility: ComponentVisibility;
  dpOn: string[];
  displayName: string;
  dataSourceIds: string[];
  id: string;
  parentId: string;
}

interface TransformResult {
  [key: string]: LowcodeComponent;
}

// Mapping type definitions
interface SizeMapping {
  [key: string]: string;
}

interface HierarchyMapping {
  [key: string]: string;
}

interface IconMapping {
  [key: string]: string;
}

interface ColorVariableMapping {
  [key: string]: ColorInfo;
}

class FigmaToLowcodeTransformer {
  private sizeMapping: SizeMapping;
  private hierarchyMapping: HierarchyMapping;
  private iconMapping: IconMapping;
  private colorVariableMapping: ColorVariableMapping;

  constructor() {
    // Mapping tables for component properties
    this.sizeMapping = {
      'xs': 'text-xs',
      'sm': 'text-sm', 
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl'
    };

    this.hierarchyMapping = {
      'Primary': 'brand',
      'Secondary': 'neutral',
      'Destructive': 'error',
    };

    this.iconMapping = {
      'clock': 'SvgRadioSelect', 
      'placeholder': 'SvgRadioSelect'
    };

    this.colorVariableMapping = {
      'VariableID:13119001a2cb3bf4ec2b3be8271d31bb940fa096/37457:7': {
        color: 'text-brand-tertiary',
        hoverColor: 'hover:text-brand-secondary',
        activeColor: 'active:text-brand-secondary'
      }
    };
  }

  transform(figmaJson: FigmaJson, componentId?: string): TransformResult {
    const figmaNode = this.extractFigmaNode(figmaJson);
    if (!figmaNode) {
      throw new Error('Invalid Figma JSON structure');
    }

    const componentProps = figmaNode.componentProperties || {};
    const textContent = this.extractTextContent(figmaNode);
    const icons = this.extractIcons(figmaNode);
    const colorInfo = this.extractColorInfo(figmaNode);
    const url = this.extractUrlInfo(figmaNode);

    const id = componentId || this.generateId();
    const componentData: TransformResult = {
      [id]: {
        component: {
          componentType: this.mapComponentType(figmaNode.name),
          appearance: {
            startDecorator: icons.leading,
            color: this.mapHierarchyToColor(componentProps.Hierarchy?.value),
            underline: "hover",
            endDecorator: icons.trailing,
            variant: this.mapSizeToVariant(componentProps.Size?.value),
            disabled: this.mapStateToDisabled(componentProps.State?.value),
            styles: colorInfo
          },
          content: {
            label: textContent,
            ...(url && { url: url }) 
          }
        },
        visibility: {
          value: true
        },
        dpOn: [],
        displayName: this.generateDisplayName(figmaNode.name),
        dataSourceIds: [],
        id: id,
        parentId: "b_uClzo" // Default parent, should be configurable
      }
    };

    return componentData;
  }

  /**
   * Extract the main Figma node from the JSON structure
   */
  private extractFigmaNode(figmaJson: FigmaJson): FigmaNode | null {
    if (figmaJson.Result?.nodes) {
      const nodeKeys = Object.keys(figmaJson.Result.nodes);
      if (nodeKeys.length > 0) {
        return figmaJson.Result.nodes[nodeKeys[0]].document;
      }
    }
    return null;
  }

  /**
   * Extract text content from Figma node
   */
  private extractTextContent(figmaNode: FigmaNode): string {
    const textNode = this.findNodeByType(figmaNode, 'TEXT');
    return textNode?.characters || 'Button CTA';
  }

  /**
   * Extract icon information from Figma node
   */
  private extractIcons(figmaNode: FigmaNode): Icons {
    const icons: Icons = { leading: null, trailing: null };
    const componentProps = figmaNode.componentProperties || {};
    
    if (componentProps.State?.value === 'Loading') {
      icons.leading = 'NoCodeLoader';
      icons.trailing = null;
      return icons;
    }
    
    if (figmaNode.children) {
      figmaNode.children.forEach(child => {
        if (child.type === 'INSTANCE' && child.componentPropertyReferences) {
          const refs = child.componentPropertyReferences;
          
          // Check for leading icon
          if (refs.visible === '⬅️ Icon leading#3287:1577') {
            const iconName = this.extractIconName(child);
            icons.leading = this.iconMapping[iconName] || iconName;
          }
          
          // Check for trailing icon
          if (refs.visible === '➡️ Icon trailing#3287:2338') {
            const iconName = this.extractIconName(child);
            icons.trailing = this.iconMapping[iconName] || iconName;
          }
        }
      });
    }

    return icons;
  }

  /**
   * Extract icon name from icon instance
   */
  private extractIconName(iconInstance: FigmaNode): string {
    return iconInstance.name || 'placeholder';
  }

  /**
   * Extract color information from bound variables
   */
  private extractColorInfo(figmaNode: FigmaNode): ColorInfo {
    const textNode = this.findNodeByType(figmaNode, 'TEXT');
    if (textNode?.boundVariables?.fills?.[0]) {
      const colorVariableId = textNode.boundVariables.fills[0].id;
      return this.colorVariableMapping[colorVariableId] || {
        color: "text-brand-tertiary",
        activeColor: "active:text-brand-secondary", 
        hoverColor: "hover:text-brand-secondary"
      };
    }
    
    return {
      color: "text-brand-tertiary",
      activeColor: "active:text-brand-secondary",
      hoverColor: "hover:text-brand-secondary"
    };
  }

  /**
   * Extract URL information from Figma node
   * Looks for hyperlinks in text nodes and their style overrides
   */
  private extractUrlInfo(figmaNode: FigmaNode): string | null {
    const textNode = this.findNodeByType(figmaNode, 'TEXT');
    
    if (!textNode) return null;

    // Check for hyperlink in style override table
    if (textNode.styleOverrideTable) {
      for (const styleKey in textNode.styleOverrideTable) {
        const style = textNode.styleOverrideTable[styleKey];
        if (style.hyperlink && style.hyperlink.url) {
          return style.hyperlink.url;
        }
      }
    }

    // Check for hyperlink in main style
    if (textNode.style && textNode.style.hyperlink && textNode.style.hyperlink.url) {
      return textNode.style.hyperlink.url;
    }

    // Check for hyperlink in character styles (if text has mixed formatting)
    if (textNode.characterStyleOverrides && textNode.characterStyleOverrides.length > 0) {
      // Find the most common style override that might contain hyperlink
      const styleOverrideId = textNode.characterStyleOverrides[0];
      if (textNode.styleOverrideTable && textNode.styleOverrideTable[styleOverrideId]) {
        const style = textNode.styleOverrideTable[styleOverrideId];
        if (style.hyperlink && style.hyperlink.url) {
          return style.hyperlink.url;
        }
      }
    }

    return null;
  }

  /**
   * Find node by type in the component tree
   */
  private findNodeByType(node: FigmaNode, type: string): FigmaNode | null {
    if (node.type === type) return node;
    
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeByType(child, type);
        if (found) return found;
      }
    }
    
    return null;
  }

  /**
   * Map Figma component name to low-code component type
   */
  private mapComponentType(figmaName?: string): string {
    if (figmaName?.includes('Link') || figmaName?.includes('link')) {
      return 'Link';
    }
    return 'Button'; // Default fallback
  }

  /**
   * Map Figma size to low-code variant
   */
  private mapSizeToVariant(size?: string): string {
    return (size && this.sizeMapping[size]) || 'text-sm';
  }

  /**
   * Map Figma hierarchy to low-code color
   */
  private mapHierarchyToColor(hierarchy?: string): string {
    return (hierarchy && this.hierarchyMapping[hierarchy]) || 'brand';
  }

  /**
   * Map Figma state to disabled property
   */
  private mapStateToDisabled(state?: string): boolean {
    return state === 'Disabled';
  }

  /**
   * Generate display name from Figma component name
   */
  private generateDisplayName(figmaName?: string): string {
    const cleanName = figmaName?.replace(/[\/\s]/g, '_') || 'Component';
    return `${cleanName}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Generate random component ID
   */
  private generateId(): string {
    return 'b_' + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Batch transform multiple Figma components
   */
  transformBatch(figmaComponents: FigmaJson[]): TransformResult {
    const results: TransformResult = {};
    
    figmaComponents.forEach((figmaJson, index) => {
      const componentId = this.generateId();
      const transformed = this.transform(figmaJson, componentId);
      Object.assign(results, transformed);
    });

    return results;
  }

  /**
   * Add custom mapping rules
   */
  addCustomMapping(mappingType: 'size' | 'hierarchy' | 'icon' | 'color', key: string, value: string | ColorInfo): void {
    switch(mappingType) {
      case 'size':
        this.sizeMapping[key] = value as string;
        break;
      case 'hierarchy':
        this.hierarchyMapping[key] = value as string;
        break;
      case 'icon':
        this.iconMapping[key] = value as string;
        break;
      case 'color':
        this.colorVariableMapping[key] = value as ColorInfo;
        break;
    }
  }
}

// Usage example
const transformer = new FigmaToLowcodeTransformer();

// Transform the provided Figma JSON
function transformFigmaToLowcode(figmaJson: FigmaJson): TransformResult | null {
  try {
    const result = transformer.transform(figmaJson, 'b_CHVXi');
    return result;
  } catch (error) {
    console.error('Transformation failed:', error);
    return null;
  }
}

// Example usage with the provided JSON
// Transform and display result
const transformedComponent = transformFigmaToLowcode(figmaData);
console.log('Transformed Component:', JSON.stringify(transformedComponent, null, 2));

// Export for use in other modules
export default FigmaToLowcodeTransformer;
export type { 
  FigmaJson, 
  FigmaNode, 
  TransformResult, 
  LowcodeComponent, 
  ColorInfo, 
  Icons 
};