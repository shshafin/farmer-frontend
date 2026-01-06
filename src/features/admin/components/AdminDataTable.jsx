export default function AdminDataTable({
  columns,
  rows,
  emptyMessage = "No data available.",
  getRowKey,
  getRowClassName,
  tableClassName = "table table-bordered table-hover",
  responsive = true,
}) {
  const TableWrapper = ({ children }) =>
    responsive ? <div className="table-responsive">{children}</div> : children;

  return (
    <TableWrapper>
      <table className={tableClassName}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.label} className={column.headerClassName}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, index) => {
            const key = getRowKey ? getRowKey(row, index) : row.id ?? index;
            const rowClassName = getRowClassName ? getRowClassName(row, index) : "";
            return (
              <tr key={key} className={rowClassName}>
                {columns.map((column) => {
                  const content = column.render ? column.render(row, index) : row[column.key];
                  return (
                    <td key={column.key || column.label} className={column.cellClassName}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrapper>
  );
}
