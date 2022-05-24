import React, { useEffect, useState } from 'react';
import { Box, Table, TableContainer, TablePagination } from '@mui/material';
import useWebSocket from 'react-use-websocket';
import { fetchSymbolTickerRecords } from '../api';
import { IBinanceSymbolTicker } from '../api/interface';
import { supportTokens, streams } from '../data/supportToken';
import type { IStreamTicker } from '../api/interface';
import EnhancedTableHead from '../components/EnhancedTableHead';
import SortTableBody from '../components/SortTableBody';

const SOCKET_END_POINT = 'wss://stream.binance.com:9443/ws';

export type Order = 'asc' | 'desc';

const rootStyles = {
  width: '100%',
};

const tableStyles = {
  minWidth: 350,
};

const Symbols = function () {
  const [symbolTickerRecord, setSymbolTickerRecord] = useState<
    Record<string, IBinanceSymbolTicker>
  >({});
  const [shouldDisplayIds, setShouldDisplayIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(SOCKET_END_POINT, {
    shouldReconnect() {
      return true;
    },
  });
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] =
    React.useState<keyof IBinanceSymbolTicker>('symbol');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof IBinanceSymbolTicker
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(
    function () {
      sendJsonMessage({
        method: 'SUBSCRIBE',
        id: 1,
        params: streams,
      });

      return function () {
        sendJsonMessage({
          method: 'UNSUBSCRIBE',
          id: 1,
          params: streams,
        });
      };
    },
    [sendJsonMessage]
  );

  useEffect(
    function () {
      if (!lastJsonMessage) return;
      setSymbolTickerRecord(function (prev) {
        const ticker = lastJsonMessage as IStreamTicker;
        const record = {
          ...prev[ticker.s],
          priceChangePercent: ticker.P,
          lastPrice: ticker.c,
        };
        return { ...prev, [ticker.s]: record };
      });
    },
    [lastJsonMessage]
  );

  useEffect(function () {
    async function fetchTransactionsHelper() {
      try {
        setIsLoading(true);
        const records = await fetchSymbolTickerRecords(supportTokens);
        setSymbolTickerRecord(records.symbolTickerRecord);
        setShouldDisplayIds(records.ids);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTransactionsHelper();
  }, []);

  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>{error.message}</Box>;

  return (
    <Box sx={rootStyles}>
      <TableContainer>
        <Table sx={tableStyles} aria-labelledby="symbolsTable">
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <SortTableBody
            records={symbolTickerRecord}
            shouldDisplayIds={shouldDisplayIds}
            order={order}
            orderBy={orderBy}
            page={page}
            rowsPerPage={rowsPerPage}
          />
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={shouldDisplayIds.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default Symbols;
