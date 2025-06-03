# button-link

# EXECUTION 
Run node script.js

# Component Property Mappings
| Figma Property                          | Low-Code Output                             |
|----------------------------------------|---------------------------------------------|
| componentProperties.Size.value       | appearance.variant → "text-sm"          |
| componentProperties.Hierarchy.value  | appearance.color → "brand"              |
| componentProperties.State.value      | appearance.disabled → true/false       |
| Component name includes "Link"       | componentType → "Link"                 |

---

# Label & Icons

| Figma                                           | Low-Code Output                                    |
|------------------------------------------------|----------------------------------------------------|
| First TEXT node (characters)               | content.label                                   |
| Child INSTANCE node with ref Icon leading    | appearance.startDecorator → mapped icon name     |
| Child INSTANCE node with ref Icon trailing   | appearance.endDecorator→ mapped icon name       |
| State = Loading                              | startDecorator → "NoCodeLoader"                |

---
