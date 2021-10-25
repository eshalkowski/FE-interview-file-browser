import React, {
  Fragment,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import FilterListIcon from '@material-ui/icons/FilterList';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { useListEntriesQuery } from './generated-api';
import FilterChip, {
  FilterChipInputTypes,
  FilterChipProps,
} from './components/FilterChip';
import { bytesToKb, kbToByte } from './file.utilities';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  gtFilter: {
    marginLeft: 8,
    background: 'transparent',
    color: 'white',
    border: 'none',
    width: 80,
  },
});

function DataGrid() {
  const classes = useStyles();
  const [sizeGt, setSizeGt] = useState<number | undefined>();
  const [sizeLt, setSizeLt] = useState<number | undefined>();
  const [typeEq, setTypeEq] = useState<string | undefined>();
  const [nameContains, setNameContains] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [filterMenuAnchor, setfilterMenuAnchor] =
    useState<null | HTMLButtonElement>(null);
  const [activeFilters, setActiveFilters] = useState<FilterChipProps[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [history, updateHistory] = useState<{ id: string; path: string }[]>([
    {
      id: '/',
      path: '/',
    },
  ]);

  // Available fiters
  const filters: { [propName: string]: FilterChipProps } = {
    gtFilter: {
      type: FilterChipInputTypes.NUMBER,
      color: 'primary',
      title: 'File Size (KB) >',
      handleValueChange: (value) => {
        setSizeGt(Number(value));
      },
      value: sizeGt,
    },
    ltFilter: {
      type: FilterChipInputTypes.NUMBER,
      color: 'primary',
      title: 'File Size (KB) <',
      handleValueChange: (value) => {
        setSizeLt(Number(value));
      },
      value: sizeLt,
    },
    type_eq: {
      type: FilterChipInputTypes.DROPDOWN,
      color: 'primary',
      title: 'Type',
      handleValueChange: (value) => {
        setTypeEq((value as string) || '');
      },
      selectValues: ['File', 'Directory'],
      value: typeEq,
    },
  };

  const { data, loading, error } = useListEntriesQuery({
    variables: {
      path: currentPath,
      page,
      where: {
        /**
         * File Size
         * @name size_gt a number value that file size should be greater than
         * @name size_lt a number value that file size should be less than
         */
        // size_gt: sizeGt, // Int
        // size_lt: Int,
        /**
         * Entry Name Contains
         * @name name_contains an entry "name" text value to search on
         */
        // name_contains: String,
        /**
         * Type Equals
         * @name type_eq Exact match for Entry type
         */
        // type_eq: "Directory" | "File",
        // deal with KB instead of bytes
        // could abstract further to deal with MB GB ... etc
        size_gt: sizeGt && kbToByte(sizeGt),
        size_lt: sizeLt && kbToByte(sizeLt),
        type_eq: typeEq,
        name_contains: nameContains,
      },
    },
  });

  useEffect(() => {
    setCurrentPath(history[history.length - 1].path);
  }, [history]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [sizeGt, sizeLt, typeEq, nameContains]);

  const rows = useMemo(() => {
    const dataRows = data?.listEntries?.entries ?? ([] as any);

    return [
      ...(history.length > 1
        ? [
            {
              id: history[history.length - 2].id,
              path: history[history.length - 2].path,
              name: 'UP_DIR',
              __typename: 'UP_DIR',
            },
          ]
        : []),
      ...dataRows,
    ];
  }, [history, data]);

  const rowCount = useMemo(() => {
    const totalUpDirRows =
      currentPath === '/'
        ? 0
        : (data?.listEntries?.pagination.pageCount ?? 0) * 1;
    const totalRowsFromServer = data?.listEntries?.pagination.totalRows ?? 0;
    return totalRowsFromServer + totalUpDirRows;
  }, [data, currentPath]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  // Set Anchor for filter menu
  const handleFilterClick = (event: MouseEvent<HTMLButtonElement>) => {
    setfilterMenuAnchor(event.currentTarget);
  };

  // Clear anchor for filter menu
  const handleMenuClose = () => setfilterMenuAnchor(null);

  // Add filter to current activeFilters []
  const handleFilterSelection = (filterName: string) => {
    setActiveFilters([...activeFilters, filters[filterName]]);
    handleMenuClose();
  };

  // Remove filter from current activeFilters []
  const handleChipClose = (title: string) => {
    setActiveFilters(activeFilters.filter((filter) => filter.title !== title));
  };

  // Handle text change on search input
  const handleContainsChange = (ev: any) => {
    setNameContains(ev.currentTarget.value);
  };

  return (
    <Box display="flex" height="100%">
      <Box flexGrow={1}>
        <Paper>
          <Toolbar>
            <Box display="flex" alignItems="baseline" width="100%">
              <TextField
                id="standard-basic"
                label="Search"
                onChange={handleContainsChange}
                style={{
                  marginLeft: -7,
                }}
              />
              <Box display="flex">
                {activeFilters.map((filter) => {
                  return (
                    <Box key={filter.title} marginLeft=".5rem">
                      <FilterChip {...filter} handleDelete={handleChipClose} />
                    </Box>
                  );
                })}
              </Box>
              <Box marginLeft="auto" alignContent="top">
                <Fab
                  style={{
                    marginTop: '-50px',
                    marginRight: '-50px',
                  }}
                  color="primary"
                  aria-label="filter"
                  onClick={handleFilterClick}
                >
                  <FilterListIcon />
                </Fab>
                <Menu
                  id="filterMenu"
                  anchorEl={filterMenuAnchor}
                  keepMounted
                  open={Boolean(filterMenuAnchor)}
                  onClose={handleMenuClose}
                >
                  {/* Only Display Non Active Filters */}
                  {Object.entries(filters).map(
                    (filterEntry, index) =>
                      !activeFilters.find(
                        (filter) => filter.title === filterEntry[1].title
                      ) && (
                        <MenuItem
                          key={index}
                          onClick={() => {
                            handleFilterSelection(filterEntry[0]);
                          }}
                        >
                          {filterEntry[1].title}
                        </MenuItem>
                      )
                  )}
                </Menu>
              </Box>
            </Box>
          </Toolbar>
          <TableContainer>
            <Table
              className={classes.table}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Path</TableCell>
                  <TableCell align="right">Name</TableCell>
                  <TableCell align="right">Type</TableCell>
                  <TableCell align="right">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!!rowCount &&
                  !loading &&
                  rows.map(({ path, __typename, name, size, id }) => {
                    const isUpDir = __typename === 'UP_DIR';
                    const isDirectory = __typename === 'Directory';
                    return (
                      <TableRow key={id}>
                        <TableCell component="th" scope="row">
                          <Button
                            color="primary"
                            disabled={__typename === 'File'}
                            startIcon={
                              isUpDir ? (
                                <MoreHorizIcon />
                              ) : __typename === 'File' ? null : (
                                <SubdirectoryArrowRightIcon />
                              )
                            }
                            onClick={() => {
                              updateHistory((h) => {
                                if (isUpDir && h.length > 1) {
                                  setPage(1);
                                  return [...h.splice(0, h.length - 1)];
                                } else {
                                  return [...h, { id: path, path }];
                                }
                              });
                            }}
                          >
                            {!isUpDir ? path : ''}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          {isUpDir ? '_' : name}
                        </TableCell>
                        <TableCell align="right">
                          {isUpDir ? '_' : __typename}
                        </TableCell>
                        <TableCell align="right">
                          {isUpDir || isDirectory
                            ? '_'
                            : `${bytesToKb(size)} KB`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            {/* Status Messages and Loading */}
            {(!rowCount || !!error || loading) && (
              <Box display="flex" justifyContent="center">
                {/* If no results show message */}
                {!rowCount && !loading && <p>No results found....</p>}
                {/* When loading show spinner */}
                {loading && (
                  <Fragment>
                    <CircularProgress color="primary" size={20} />
                    <p>Loading.....</p>
                  </Fragment>
                )}
                {/* Show error when error */}
                {!!error && <p>Error loading the table! {error.message}</p>}
              </Box>
            )}
          </TableContainer>
          <Box style={{ display: 'flex', justifyContent: 'right' }}>
            <TablePagination
              rowsPerPageOptions={[]}
              component="div"
              count={rowCount}
              rowsPerPage={25}
              page={page - 1}
              onChangePage={handleChangePage}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default DataGrid;
