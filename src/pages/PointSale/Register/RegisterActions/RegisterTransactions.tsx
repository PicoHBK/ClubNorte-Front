import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  Package,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetRegisterById } from '@/hooks/admin/Register/useGetRegisterById';

interface RegisterTransactionsProps {
  id: number;
}

interface Income {
  id: number;
  items: {
    id: number;
    product: {
      id: number;
      code: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  description: string;
  total: number;
  payment_method: string;
  created_at: string;
}

interface Expense {
  id: number;
  total: number;
  payment_method: string;
  created_at: string;
}

const RegisterTransactions: React.FC<RegisterTransactionsProps> = ({ id }) => {
  const { register, isLoading, isError, error } = useGetRegisterById(id);
  const [sortingIncome, setSortingIncome] = useState<SortingState>([]);
  const [sortingExpense, setSortingExpense] = useState<SortingState>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatFullDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('efectivo') || methodLower.includes('cash')) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Efectivo</Badge>;
    }
    return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">{method}</Badge>;
  };

  const incomeColumns: ColumnDef<Income>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-slate-300 font-mono text-xs">#{row.getValue("id")}</span>,
      size: 50,
    },
    {
      accessorKey: "items",
      header: "Productos",
      cell: ({ row }) => {
        const items = row.original.items;
        return (
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-white text-sm">{items.length}</span>
          </div>
        );
      },
      size: 80,
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-200 hover:text-white h-7 px-1"
        >
          Monto
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-emerald-400 font-semibold text-sm">
          {formatCurrency(row.getValue("total"))}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "created_at",
      header: "Hora",
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs font-mono">
          {formatTime(row.getValue("created_at"))}
        </span>
      ),
      size: 70,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-emerald-500/10"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Ingreso #{row.original.id}</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                {formatFullDate(row.original.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {row.original.description && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Descripción</p>
                  <p className="text-white text-sm">{row.original.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Productos ({row.original.items.length})
                </p>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {row.original.items.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-slate-400">Código: {item.product.code}</p>
                        </div>
                        <p className="text-emerald-400 font-semibold text-sm whitespace-nowrap">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Cantidad: {item.quantity}</span>
                        <span>{formatCurrency(item.price)} c/u</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-slate-300 text-sm">Método de pago</span>
                {getPaymentMethodBadge(row.original.payment_method)}
              </div>

              <div className="flex justify-between items-center bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <span className="text-white font-medium">Total</span>
                <span className="text-emerald-400 font-bold text-xl">
                  {formatCurrency(row.original.total)}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ),
      size: 50,
    },
  ];

  const expenseColumns: ColumnDef<Expense>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-slate-300 font-mono text-xs">#{row.getValue("id")}</span>,
      size: 50,
    },
    {
      accessorKey: "payment_method",
      header: "Método",
      cell: ({ row }) => getPaymentMethodBadge(row.getValue("payment_method")),
      size: 100,
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-200 hover:text-white h-7 px-1"
        >
          Monto
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-red-400 font-semibold text-sm">
          {formatCurrency(row.getValue("total"))}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "created_at",
      header: "Hora",
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs font-mono">
          {formatTime(row.getValue("created_at"))}
        </span>
      ),
      size: 70,
    },
  ];

  const incomeTable = useReactTable({
    data: register?.income || [],
    columns: incomeColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSortingIncome,
    state: {
      sorting: sortingIncome,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const expenseTable = useReactTable({
    data: register?.expenses || [],
    columns: expenseColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSortingExpense,
    state: {
      sorting: sortingExpense,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-slate-700 rounded"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (isError || !register) {
    return (
      <div className="text-center p-6">
        <p className="text-red-400 text-sm">
          {error?.message || "Error al cargar las transacciones"}
        </p>
      </div>
    );
  }

  const totalIncome = register.income.reduce((sum, income) => sum + income.total, 0);
  const totalExpense = register.expenses.reduce((sum, expense) => sum + expense.total, 0);

  return (
    <div className="space-y-4">
      {/* Resumen compacto */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 text-xs">Ingresos</span>
          </div>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-slate-400">{register.income.length} transacciones</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-slate-300 text-xs">Egresos</span>
          </div>
          <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-slate-400">{register.expenses.length} transacciones</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 rounded-lg border border-slate-700 h-9">
          <TabsTrigger
            value="income"
            className="text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg transition-colors text-sm"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger
            value="expense"
            className="text-slate-300 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg transition-colors text-sm"
          >
            <TrendingDown className="w-3 h-3 mr-1" />
            Egresos
          </TabsTrigger>
        </TabsList>

        {/* Tabla de Ingresos */}
        <TabsContent value="income" className="space-y-3 mt-3">
          <div className="rounded-lg border border-white/20 overflow-hidden bg-slate-900/50">
            <div className="overflow-auto max-h-[320px]">
              <Table>
                <TableHeader className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                  {incomeTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-white/10">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-slate-200 h-8 text-xs">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {incomeTable.getRowModel().rows?.length ? (
                    incomeTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={incomeColumns.length} className="h-24 text-center">
                        <p className="text-slate-400 text-sm">No hay ingresos</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {incomeTable.getPageCount() > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Página {incomeTable.getState().pagination.pageIndex + 1} de {incomeTable.getPageCount()}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => incomeTable.previousPage()}
                  disabled={!incomeTable.getCanPreviousPage()}
                  className="h-7 w-7 p-0 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => incomeTable.nextPage()}
                  disabled={!incomeTable.getCanNextPage()}
                  className="h-7 w-7 p-0 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tabla de Egresos */}
        <TabsContent value="expense" className="space-y-3 mt-3">
          <div className="rounded-lg border border-white/20 overflow-hidden bg-slate-900/50">
            <div className="overflow-auto max-h-[320px]">
              <Table>
                <TableHeader className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                  {expenseTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-white/10">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-slate-200 h-8 text-xs">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {expenseTable.getRowModel().rows?.length ? (
                    expenseTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={expenseColumns.length} className="h-24 text-center">
                        <p className="text-slate-400 text-sm">No hay egresos</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {expenseTable.getPageCount() > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Página {expenseTable.getState().pagination.pageIndex + 1} de {expenseTable.getPageCount()}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => expenseTable.previousPage()}
                  disabled={!expenseTable.getCanPreviousPage()}
                  className="h-7 w-7 p-0 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => expenseTable.nextPage()}
                  disabled={!expenseTable.getCanNextPage()}
                  className="h-7 w-7 p-0 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegisterTransactions;