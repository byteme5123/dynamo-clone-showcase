import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportExcelButtonProps {
  users: any[];
  dateRange: { from: string; to: string };
}

export function ExportExcelButton({ users, dateRange }: ExportExcelButtonProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });

  const exportToExcel = (filterByDate: boolean = false) => {
    const excelData: any[] = [];

    users.forEach(user => {
      user.orders.forEach((order: any) => {
        const purchaseDate = new Date(order.created_at);
        
        if (filterByDate && customDateRange.from && customDateRange.to) {
          const fromDate = new Date(customDateRange.from);
          const toDate = new Date(customDateRange.to);
          
          if (purchaseDate < fromDate || purchaseDate > toDate) {
            return;
          }
        }

        excelData.push({
          'Transaction ID': order.transaction_id,
          'Date': new Date(order.created_at).toLocaleDateString(),
          'User Name': user.name,
          'Email': user.email,
          'Plan Name': order.plan_name,
          'Amount': `$${order.amount.toFixed(2)}`,
          'Currency': order.currency,
          'Status': order.status,
          'Payment Method': 'PayPal'
        });
      });
    });

    const totalRevenue = excelData.reduce((sum, row) => {
      const amount = parseFloat(row.Amount.replace('$', ''));
      return sum + amount;
    }, 0);

    excelData.push({});
    excelData.push({
      'Transaction ID': 'TOTAL',
      'Amount': `$${totalRevenue.toFixed(2)}`,
      'Date': `Total Transactions: ${excelData.length - 2}`
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 30 },
      { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income Statement');

    const filename = filterByDate && customDateRange.from && customDateRange.to
      ? `income_statement_${customDateRange.from}_to_${customDateRange.to}.xlsx`
      : `income_statement_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, filename);
    setShowDatePicker(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md"
      >
        <Download className="w-5 h-5" />
        Export Excel
      </button>

      {showDatePicker && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDatePicker(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-xl border border-border z-50 p-4">
            <h3 className="font-semibold text-foreground mb-4">Export Options</h3>

            <button
              onClick={() => exportToExcel(false)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition mb-3"
            >
              Export All Data
            </button>

            <div className="border-t border-border pt-3">
              <p className="text-sm text-muted-foreground mb-2">Export by Date Range:</p>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">From Date</label>
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">To Date</label>
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>

                <button
                  onClick={() => exportToExcel(true)}
                  disabled={!customDateRange.from || !customDateRange.to}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-muted disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Export with Date Filter
                  </div>
                </button>
              </div>
            </div>

            <div className="border-t border-border mt-3 pt-3">
              <p className="text-xs text-muted-foreground mb-2">Quick Filters:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setCustomDateRange({
                      from: lastWeek.toISOString().split('T')[0],
                      to: today.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition"
                >
                  Last Week
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    setCustomDateRange({
                      from: lastMonth.toISOString().split('T')[0],
                      to: today.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition"
                >
                  Last Month
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    setCustomDateRange({
                      from: firstDayOfMonth.toISOString().split('T')[0],
                      to: today.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition"
                >
                  This Month
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                    setCustomDateRange({
                      from: firstDayOfYear.toISOString().split('T')[0],
                      to: today.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition"
                >
                  This Year
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
