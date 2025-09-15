import { useState } from "react"
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table"

import { Eye, Search, ArrowUpDown } from "lucide-react"
import { useGetAllUsers, type User } from "@/hooks/admin/users/useGetAllUsers"

const TableUsers = () => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  // Llamamos a la API
  const { users, isLoading } = useGetAllUsers()

  const columnHelper = createColumnHelper<User>()

  /** � Filtro global personalizado */
  const customGlobalFilter: FilterFn<User> = (row, _columnId, filterValue) => {
    const search = filterValue.toLowerCase()
    const user = row.original
    return (
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.username.toLowerCase().includes(search) ||
      user.role.name.toLowerCase().includes(search)
    )
  }

  /** �️ Definición de columnas */
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: info => (
        <span className="text-slate-400 font-mono">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor(row => `${row.first_name} ${row.last_name}`, {
      id: "full_name",
      header: "Nombre",
      cell: info => (
        <span className="font-medium text-white">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("username", {
      header: "Usuario",
      cell: info => (
        <span className="text-slate-300">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: info => (
        <span className="text-slate-300">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("cellphone", {
      header: "Teléfono",
      cell: info => (
        <span className="text-slate-300">{info.getValue()}</span>
      ),
    }),

    // � Columna de Rol
    columnHelper.accessor(row => row.role?.name ?? "Sin rol", {
      id: "role",
      header: () => (
        <button className="flex items-center gap-1 text-slate-300 hover:text-white transition">
          Rol
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: info => (
        <span className="text-indigo-400 font-medium capitalize">
          {info.getValue()}
        </span>
      ),
    }),

    // ⚙️ Acciones
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: info => (
        <button
          onClick={() => alert(`Ver detalles del usuario ${info.row.original.id}`)}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    }),
  ]

  /** Inicializamos la tabla */
  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: customGlobalFilter,
  })

  if (isLoading) {
    return (
      <div className="p-6 text-slate-400 text-center">Cargando usuarios...</div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-6xl space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario, email o rol..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler?.()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="w-4 h-4 inline ml-1 text-slate-500" />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/10">
              {table.getFilteredRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-sm text-slate-400"
                  >
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TableUsers
