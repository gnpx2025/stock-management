import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LanguageService, TranslatePipe } from '@erp/i18n';
import { ErpIconComponent } from '@erp/ui';
import { SHELL_NAV_MENU } from '../nav/shell-nav-menu.data';
import { NavNode, NavSection } from '../nav/shell-nav.types';

const SELECTED_NAV_STORAGE_KEY = 'erp.shell.sidebar.selectedNavId';

@Component({
  selector: 'app-shell-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, ErpIconComponent, TranslatePipe],
  templateUrl: './shell-sidebar.html',
  styleUrl: './shell-sidebar.scss',
})
export class ShellSidebarComponent {
  /** Touched so OnPush refreshes when locale changes (pipe is impure; host still needs CD trigger). */
  protected readonly language = inject(LanguageService);

  protected readonly sections: NavSection[] = SHELL_NAV_MENU;
  protected readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedId = signal<string | null>(null);

  constructor() {
    this.restoreSelection();
  }

  protected navKey(id: string): string {
    return `shell.nav.${id}`;
  }

  protected hasChildren(node: NavNode): boolean {
    return Array.isArray(node.children) && node.children.length > 0;
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected isSelected(id: string): boolean {
    return this.selectedId() === id;
  }

  protected toggle(node: NavNode): void {
    if (!this.hasChildren(node)) {
      return;
    }

    const next = new Set(this.expandedIds());
    if (next.has(node.id)) {
      next.delete(node.id);
      for (const descendantId of collectDescendantIds(node)) {
        next.delete(descendantId);
      }
    } else {
      next.add(node.id);
    }
    this.expandedIds.set(next);
  }

  protected select(node: NavNode): void {
    if (this.hasChildren(node)) {
      return;
    }

    this.selectedId.set(node.id);
    const ancestors = findAncestorIds(this.sections, node.id) ?? [];
    this.expandedIds.update((current) => new Set([...current, ...ancestors]));
    persistSelectedId(node.id);
  }

  private restoreSelection(): void {
    const stored = readSelectedId();
    if (!stored) {
      return;
    }

    const ancestors = findAncestorIds(this.sections, stored);
    if (ancestors === null) {
      return;
    }

    this.selectedId.set(stored);
    this.expandedIds.set(new Set(ancestors));
  }
}

/** Exported for unit tests — clears nested expand state on parent collapse. */
export function collectDescendantIds(node: NavNode): string[] {
  const ids: string[] = [];
  const walk = (current: NavNode): void => {
    for (const child of current.children ?? []) {
      ids.push(child.id);
      walk(child);
    }
  };
  walk(node);
  return ids;
}

/** Ancestor ids from root to parent of `targetId` (empty if first-level). `null` if not found. */
export function findAncestorIds(sections: NavSection[], targetId: string): string[] | null {
  for (const section of sections) {
    for (const item of section.items) {
      const path = findPathToTarget(item, targetId, []);
      if (path !== null) {
        return path;
      }
    }
  }
  return null;
}

function findPathToTarget(
  node: NavNode,
  targetId: string,
  ancestors: string[],
): string[] | null {
  if (node.id === targetId) {
    return ancestors;
  }
  for (const child of node.children ?? []) {
    const found = findPathToTarget(child, targetId, [...ancestors, node.id]);
    if (found !== null) {
      return found;
    }
  }
  return null;
}

function readSelectedId(): string | null {
  try {
    return localStorage.getItem(SELECTED_NAV_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistSelectedId(id: string): void {
  try {
    localStorage.setItem(SELECTED_NAV_STORAGE_KEY, id);
  } catch {
    /* ignore quota / private mode */
  }
}
