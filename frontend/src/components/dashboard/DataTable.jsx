import { Search } from 'lucide-react';
import Pagination from './Pagination';

export default function DataTable({
  title,
  columns = [],
  data = [],
  keyExtractor = (item, index) => item.id ?? index,
  loading = false,
  error = null,
  emptyText = '暂无数据',

  headerExtra = null,
  headerActions = null,

  searchValue = '',
  onSearchChange = null,
  onSearchClear = null,
  searchPlaceholder = '搜索...',

  pagination = null,

  onRowClick = null,
}) {
  const renderSearch = () => {
    if (!onSearchChange) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {searchValue && onSearchClear && (
            <button
              type="button"
              onClick={onSearchClear}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
            >
              清除
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
        </div>
        {headerExtra}
        {renderSearch()}
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {headerExtra}
        </div>
        {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {renderSearch()}

      {data.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col, i) => (
                    <th
                      key={col.key ?? i}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.headerClassName ?? ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, rowIndex) => {
                  const rowKey = keyExtractor(item, rowIndex);
                  return (
                    <tr
                      key={rowKey}
                      className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={onRowClick ? () => onRowClick(item) : undefined}
                    >
                      {columns.map((col, colIndex) => {
                        const cellValue = item[col.key];
                        const rendered = col.render ? col.render(cellValue, item, rowIndex) : cellValue;
                        return (
                          <td
                            key={`${rowKey}-${col.key ?? colIndex}`}
                            className={`px-6 py-4 whitespace-nowrap text-sm ${col.className ?? 'text-gray-500'}`}
                          >
                            {rendered}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize ?? 10}
              onPageChange={pagination.onPageChange}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyText}</p>
        </div>
      )}
    </div>
  );
}
