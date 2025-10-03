const { useState, useMemo, useCallback } = require("react");

// Custom hook for pagination logic
const usePagination = (data, initialRowsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = useMemo(
    () => Math.ceil(data.length / rowsPerPage),
    [data.length, rowsPerPage],
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, rowsPerPage]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const changeRowsPerPage = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    rowsPerPage,
    paginatedData,
    goToPage,
    changeRowsPerPage,
    setCurrentPage,
  };
};

export default usePagination;
