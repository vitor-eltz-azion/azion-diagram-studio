# Editor enhancements

## Implemented interaction model

The editor is a focused Webkit shell (back, breadcrumb, Save, Export) over a component library, canvas, and a Design / Prompt / Export inspector built from Webkit fields. Diagram data and operations are shared with the TypeScript CLI.

| Feature         | How to use it                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Move boundaries | Drag the label or perimeter. Enclosed unlocked objects move together; disable “Move enclosed objects” to move only the boundary.         |
| Resize          | Select a node or boundary and drag a corner. Sizes and movement stay within the canvas content area.                                     |
| Multi-select    | Shift-click objects or drag a box across the canvas. Drag any selected component to move the set.                                        |
| Arrange         | With multiple components selected, use alignment, Space X/Y (three or more), or Wrap in boundary.                                        |
| Duplicate       | Toolbar or Cmd/Ctrl+D. Copies selected objects and internal connections with fresh IDs.                                                  |
| Lock            | Inspector Lock/Unlock protects position, properties, resizing, and deletion.                                                             |
| Shape library   | Add service cards, rectangles, ellipses, decisions, or text annotations. ⌘K / Ctrl+K searches every icon; Change icon swaps one.         |
| Connect         | Press C, then click a source and a destination or drag from one to the other. Or select a component and choose Connect in the inspector. |
| Lines           | Orthogonal, straight, or curved; arrowheads at the end, both ends, or neither; solid/dashed styles.                                      |
| Navigate        | H or Space+drag pans. Zoom controls or Cmd/Ctrl+wheel zoom; 0 resets pan and zoom.                                                       |
| Precision       | 8/16/32px grid, snapping, numeric coordinates/dimensions, arrow-key nudges, Alt for 1px or unsnapped dragging.                           |
| History         | Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z. One mouse gesture is one undo action; history keeps 100 edits per open editor.                          |
| Interchange     | JSON and Diagram Studio SVG imports retain editable objects. Export JSON, SVG, HTML, PNG, or a prompt.                                   |

Boundary membership is geometric containment, not permanent parenting. Resizing a boundary changes membership without resizing its objects. Deleting a boundary leaves its objects; deleting a component removes attached connections. Locked children stay in place when an enclosing boundary moves. Alignment affects selected unlocked components.

## draw.io references

The user-provided screenshot and official [Arrange panel](https://www.drawio.com/docs/manual/editor/panels/arrange-tab/), [alignment tools](https://www.drawio.com/docs/manual/editor/alignment-tools/), [shape resizing](https://www.drawio.com/docs/manual/shapes/shape-resize/), and [modifier shortcuts](https://www.drawio.com/docs/reference/shortcuts/modifier-shortcuts-in-diagrams/) informed the editor's library/canvas/inspector layout, selection actions, corner handles, and keyboard controls. No draw.io source code or artwork was copied.

## Useful next additions

- Connector waypoints and obstacle avoidance for dense architectures.
- Persistent groups and explicit z-order controls for overlapping boundaries.
- Reusable custom templates and team libraries.
- Multiple pages with an overview and linked detail views.
- Explicit draw.io XML interchange as a separate importer.

These are suggestions, not existing features. The current CLI automatic layout arranges unlocked nodes into rows; it does not reroute around obstacles or resize existing boundaries.
