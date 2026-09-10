import { NavSection } from './shell-nav.types';

export const SHELL_NAV_MENU: NavSection[] = [
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [{ id: 'operations.dashboard', label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    id: 'sales',
    label: 'SALES',
    items: [
      {
        id: 'sales.transactions',
        label: 'Transactions',
        icon: 'receipt_long',
        children: [
          { id: 'sales.transactions.quotation', label: 'Quotation' },
          { id: 'sales.transactions.sales-order', label: 'Sales Order' },
          { id: 'sales.transactions.delivery-dispatch', label: 'Delivery / Dispatch' },
          { id: 'sales.transactions.sales-invoice', label: 'Sales Invoice' },
          {
            id: 'sales.transactions.sales-return',
            label: 'Sales Return',
            children: [
              { id: 'sales.transactions.sales-return.credit-note', label: 'Credit Note' },
            ],
          },
        ],
      },
      {
        id: 'sales.operations',
        label: 'Operations',
        icon: 'storefront',
        children: [
          { id: 'sales.operations.point-of-sale', label: 'Point of Sale' },
          {
            id: 'sales.operations.counter-sales',
            label: 'Counter Sales',
            children: [
              {
                id: 'sales.operations.counter-sales.customer-orders',
                label: 'Customer Orders',
              },
            ],
          },
          {
            id: 'sales.operations.reports',
            label: 'Reports',
            children: [
              { id: 'sales.operations.reports.summary', label: 'Sales Summary' },
              { id: 'sales.operations.reports.detail', label: 'Sales Detail' },
              { id: 'sales.operations.reports.by-customer', label: 'Sales by Customer' },
              { id: 'sales.operations.reports.by-item', label: 'Sales by Item' },
              { id: 'sales.operations.reports.by-salesman', label: 'Sales by Salesman' },
              { id: 'sales.operations.reports.by-outlet', label: 'Sales by Outlet' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'purchasing',
    label: 'PURCHASING',
    items: [
      {
        id: 'purchasing.transactions',
        label: 'Transactions',
        icon: 'shopping_cart',
        children: [
          { id: 'purchasing.transactions.purchase-request', label: 'Purchase Request' },
          { id: 'purchasing.transactions.purchase-order', label: 'Purchase Order' },
          { id: 'purchasing.transactions.goods-receipt', label: 'Goods Receipt' },
          {
            id: 'purchasing.transactions.purchase-invoice',
            label: 'Purchase Invoice',
            children: [
              {
                id: 'purchasing.transactions.purchase-invoice.purchase-return',
                label: 'Purchase Return',
              },
            ],
          },
          {
            id: 'purchasing.transactions.reports',
            label: 'Reports',
            children: [
              { id: 'purchasing.transactions.reports.summary', label: 'Purchase Summary' },
              { id: 'purchasing.transactions.reports.detail', label: 'Purchase Detail' },
              {
                id: 'purchasing.transactions.reports.supplier-analysis',
                label: 'Supplier Analysis',
              },
              { id: 'purchasing.transactions.reports.by-item', label: 'Purchase by Item' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'INVENTORY',
    items: [
      {
        id: 'inventory.transactions',
        label: 'Transactions',
        icon: 'inventory_2',
        children: [
          { id: 'inventory.transactions.stock-receipt', label: 'Stock Receipt' },
          { id: 'inventory.transactions.stock-issue', label: 'Stock Issue' },
          { id: 'inventory.transactions.stock-transfer', label: 'Stock Transfer' },
          { id: 'inventory.transactions.stock-adjustment', label: 'Stock Adjustment' },
          {
            id: 'inventory.transactions.stock-opening',
            label: 'Stock Opening',
            children: [
              {
                id: 'inventory.transactions.stock-opening.stock-return',
                label: 'Stock Return',
              },
            ],
          },
        ],
      },
      {
        id: 'inventory.operations',
        label: 'Operations',
        icon: 'warehouse',
        children: [
          { id: 'inventory.operations.stock-count', label: 'Stock Count' },
          {
            id: 'inventory.operations.batch-management',
            label: 'Batch Management',
            children: [
              {
                id: 'inventory.operations.batch-management.serial-number',
                label: 'Serial Number Management',
              },
            ],
          },
          {
            id: 'inventory.operations.reports',
            label: 'Reports',
            children: [
              { id: 'inventory.operations.reports.summary', label: 'Stock Summary' },
              { id: 'inventory.operations.reports.ledger', label: 'Stock Ledger' },
              { id: 'inventory.operations.reports.valuation', label: 'Stock Valuation' },
              {
                id: 'inventory.operations.reports.fast-moving',
                label: 'Fast Moving Items',
              },
              {
                id: 'inventory.operations.reports.slow-moving',
                label: 'Slow Moving Items',
              },
              {
                id: 'inventory.operations.reports.non-moving',
                label: 'Non Moving Items',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'finance',
    label: 'FINANCE',
    items: [
      {
        id: 'finance.accounting',
        label: 'Accounting',
        icon: 'account_balance',
        children: [
          { id: 'finance.accounting.chart-of-accounts', label: 'Chart of Accounts' },
          { id: 'finance.accounting.journal-entry', label: 'Journal Entry' },
          { id: 'finance.accounting.general-ledger', label: 'General Ledger' },
          { id: 'finance.accounting.trial-balance', label: 'Trial Balance' },
          {
            id: 'finance.accounting.profit-loss',
            label: 'Profit & Loss',
            children: [
              { id: 'finance.accounting.profit-loss.balance-sheet', label: 'Balance Sheet' },
            ],
          },
        ],
      },
      {
        id: 'finance.receivables',
        label: 'Receivables',
        icon: 'request_quote',
        children: [
          { id: 'finance.receivables.customer-receipts', label: 'Customer Receipts' },
          {
            id: 'finance.receivables.outstanding',
            label: 'Outstanding Receivables',
            children: [
              {
                id: 'finance.receivables.outstanding.customer-ledger',
                label: 'Customer Ledger',
              },
            ],
          },
        ],
      },
      {
        id: 'finance.payables',
        label: 'Payables',
        icon: 'payments',
        children: [
          { id: 'finance.payables.supplier-payments', label: 'Supplier Payments' },
          {
            id: 'finance.payables.outstanding',
            label: 'Outstanding Payables',
            children: [
              {
                id: 'finance.payables.outstanding.supplier-ledger',
                label: 'Supplier Ledger',
              },
            ],
          },
        ],
      },
      {
        id: 'finance.cash-bank',
        label: 'Cash & Bank',
        icon: 'account_balance_wallet',
        children: [
          { id: 'finance.cash-bank.cash-transactions', label: 'Cash Transactions' },
          { id: 'finance.cash-bank.bank-transactions', label: 'Bank Transactions' },
          {
            id: 'finance.cash-bank.bank-reconciliation',
            label: 'Bank Reconciliation',
            children: [
              {
                id: 'finance.cash-bank.bank-reconciliation.cash-position',
                label: 'Cash Position',
              },
            ],
          },
          { id: 'finance.cash-bank.reports', label: 'Reports' },
        ],
      },
    ],
  },
  {
    id: 'master-data',
    label: 'MASTER DATA',
    items: [
      {
        id: 'master-data.parties',
        label: 'Parties',
        icon: 'groups',
        children: [
          { id: 'master-data.parties.customers', label: 'Customers' },
          { id: 'master-data.parties.suppliers', label: 'Suppliers' },
          {
            id: 'master-data.parties.salesmen',
            label: 'Salesmen',
            children: [{ id: 'master-data.parties.salesmen.contacts', label: 'Contacts' }],
          },
        ],
      },
      {
        id: 'master-data.products',
        label: 'Products',
        icon: 'category',
        children: [
          { id: 'master-data.products.items', label: 'Items' },
          { id: 'master-data.products.categories', label: 'Categories' },
          { id: 'master-data.products.item-groups', label: 'Item Groups' },
          { id: 'master-data.products.brands', label: 'Brands' },
          {
            id: 'master-data.products.units',
            label: 'Units',
            children: [
              {
                id: 'master-data.products.units.conversions',
                label: 'Unit Conversions',
              },
            ],
          },
        ],
      },
      {
        id: 'master-data.organization',
        label: 'Organization',
        icon: 'business',
        children: [
          { id: 'master-data.organization.companies', label: 'Companies' },
          { id: 'master-data.organization.branches', label: 'Branches' },
          { id: 'master-data.organization.departments', label: 'Departments' },
          {
            id: 'master-data.organization.warehouses',
            label: 'Warehouses',
            children: [
              { id: 'master-data.organization.warehouses.locations', label: 'Locations' },
            ],
          },
        ],
      },
      {
        id: 'master-data.finance',
        label: 'Finance',
        icon: 'currency_exchange',
        children: [
          { id: 'master-data.finance.currencies', label: 'Currencies' },
          { id: 'master-data.finance.banks', label: 'Banks' },
          { id: 'master-data.finance.tax-codes', label: 'Tax Codes' },
          { id: 'master-data.finance.payment-terms', label: 'Payment Terms' },
          { id: 'master-data.finance.payment-methods', label: 'Payment Methods' },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'REPORTS',
    items: [
      { id: 'reports.sales', label: 'Sales Reports', icon: 'bar_chart' },
      { id: 'reports.purchase', label: 'Purchase Reports', icon: 'assessment' },
      { id: 'reports.inventory', label: 'Inventory Reports', icon: 'analytics' },
      { id: 'reports.finance', label: 'Finance Reports', icon: 'monitoring' },
      { id: 'reports.customer', label: 'Customer Reports', icon: 'person_search' },
      {
        id: 'reports.supplier',
        label: 'Supplier Reports',
        icon: 'store',
        children: [{ id: 'reports.supplier.management', label: 'Management Reports' }],
      },
    ],
  },
  {
    id: 'administration',
    label: 'ADMINISTRATION',
    items: [
      { id: 'administration.users', label: 'Users', icon: 'person' },
      {
        id: 'administration.roles-permissions',
        label: 'Roles & Permissions',
        icon: 'admin_panel_settings',
      },
      {
        id: 'administration.company-settings',
        label: 'Company Settings',
        icon: 'domain',
      },
      {
        id: 'administration.branch-settings',
        label: 'Branch Settings',
        icon: 'apartment',
      },
      {
        id: 'administration.document-numbering',
        label: 'Document Numbering',
        icon: 'pin',
      },
      {
        id: 'administration.approval-workflows',
        label: 'Approval Workflows',
        icon: 'approval',
      },
      { id: 'administration.audit-trail', label: 'Audit Trail', icon: 'history' },
      {
        id: 'administration.system-settings',
        label: 'System Settings',
        icon: 'settings',
      },
    ],
  },
  {
    id: 'utilities',
    label: 'UTILITIES',
    items: [
      { id: 'utilities.import-data', label: 'Import Data', icon: 'upload_file' },
      { id: 'utilities.export-data', label: 'Export Data', icon: 'download' },
      {
        id: 'utilities.data-validation',
        label: 'Data Validation',
        icon: 'fact_check',
      },
      { id: 'utilities.system-tools', label: 'System Tools', icon: 'build' },
    ],
  },
];
