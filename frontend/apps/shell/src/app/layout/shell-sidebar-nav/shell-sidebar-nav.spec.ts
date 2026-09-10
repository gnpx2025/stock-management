import { collectDescendantIds, findAncestorIds } from './shell-sidebar-nav';
import { NavNode, NavSection } from '../nav/shell-nav.types';

describe('collectDescendantIds', () => {
  it('collects nested descendant ids', () => {
    const tree: NavNode = {
      id: 'root',
      label: 'Root',
      children: [
        {
          id: 'a',
          label: 'A',
          children: [{ id: 'a1', label: 'A1' }],
        },
        { id: 'b', label: 'B' },
      ],
    };

    expect(collectDescendantIds(tree).sort()).toEqual(['a', 'a1', 'b']);
  });

  it('returns empty for leaves', () => {
    expect(collectDescendantIds({ id: 'leaf', label: 'Leaf' })).toEqual([]);
  });
});

describe('findAncestorIds', () => {
  const sections: NavSection[] = [
    {
      id: 'sales',
      label: 'SALES',
      items: [
        {
          id: 'sales.transactions',
          label: 'Transactions',
          children: [
            {
              id: 'sales.transactions.sales-return',
              label: 'Sales Return',
              children: [
                { id: 'sales.transactions.sales-return.credit-note', label: 'Credit Note' },
              ],
            },
          ],
        },
        { id: 'sales.dashboard', label: 'Dashboard' },
      ],
    },
  ];

  it('returns ancestor ids for a nested leaf', () => {
    expect(findAncestorIds(sections, 'sales.transactions.sales-return.credit-note')).toEqual([
      'sales.transactions',
      'sales.transactions.sales-return',
    ]);
  });

  it('returns empty ancestors for a first-level leaf', () => {
    expect(findAncestorIds(sections, 'sales.dashboard')).toEqual([]);
  });

  it('returns null when id is missing', () => {
    expect(findAncestorIds(sections, 'missing')).toBeNull();
  });
});
