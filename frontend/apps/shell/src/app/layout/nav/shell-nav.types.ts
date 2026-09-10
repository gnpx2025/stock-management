export interface NavNode {
  id: string;
  label: string;
  /** Material icon name; shown for first-level items only. */
  icon?: string;
  children?: NavNode[];
}

export interface NavSection {
  id: string;
  label: string;
  items: NavNode[];
}
