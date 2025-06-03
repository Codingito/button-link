# button-link
# Features
1. Detects Buttons/Link components in Figma files.
2. Extracts and maps properties like size, hierarchy, state, icons, URLs, and colors.
3. Supports batch transformation.
4. Allows custom mapping for icons, colors, sizes, and hierarchies.
5. Outputs a JSON representation suitable for low-code platforms.

   
# Component Property Mappings
Figma Property	                          Low-Code Output
componentProperties.Size.value	       appearance.variant → "text-sm"
componentProperties.Hierarchy.value	   appearance.color → "brand"
componentProperties.State.value	       appearance.disabled → true/false
Component name includes "Link"	       componentType → "Link"

# Label & Icons
Figma	                                            Low-Code Output
First TEXT node (characters)	                 content.label
Child INSTANCE node with ref Icon leading	     appearance.startDecorator → mapped icon name
Child INSTANCE node with ref Icon trailing	   appearance.endDecorator → mapped icon name
State = Loading	startDecorator →               "NoCodeLoader"

# Color & Styling Mappings
Figma	                                     Low-Code Output
Bound variable for fills.id       	    Mapped to Tailwind-style colors in styles.color, hoverColor, etc.
Example: VariableID:131.../37457:7	   "text-brand-tertiary"
hover/active color styles	             "hover:text-brand-secondary", "active:text-brand-secondary"

# Hyperlink Detection
Figma Text Node Hyperlink	               Low-Code Output
style.hyperlink.url or override URL	     content.url


# EXECUTION 
Run node script.js
