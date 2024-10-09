'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as d3 from 'd3';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';

export interface TodayOrdersProps {
  sx?: SxProps;
}

export function TodayOrders({ sx }: TodayOrdersProps): React.JSX.Element {
  const [orders, setOrders] = useState(0);
  const [diff, setDiff] = useState<number | null>(null);
  const [trend, setTrend] = useState<'up' | 'down'>('up');

  useEffect(() => {
    // Load and process the CSV file
    d3.csv('/datasets/transactions_new.csv').then(function (data) {
      // Extract date parts as YYYY-MM-DD strings
      data.forEach((d: any) => {
        d.date_only = d.created_at.split(' ')[0]; // assuming created_at is in the format 'YYYY-MM-DD HH:mm:ss'
      });

      // Find the latest date string in the dataset
      const latestDate = d3.max(data, (d: any) => d.date_only);

      // Filter transactions by the latest date string
      const latestTransactions = data.filter((d: any) => d.date_only === latestDate);

      // Calculate the total number of orders (transactions) for the latest date
      const totalOrders = latestTransactions.length;

      // Find the second latest date (yesterday)
      const secondLatestDate = d3.max(data.filter((d: any) => d.date_only < latestDate), (d: any) => d.date_only);

      // Filter transactions by the second latest date string
      const secondLatestTransactions = data.filter((d: any) => d.date_only === secondLatestDate);

      // Calculate the total number of orders (transactions) for the second latest date
      const totalOrdersYesterday = secondLatestTransactions.length;

      // Calculate the percentage difference
      const ordersDiff = ((totalOrders - totalOrdersYesterday) / totalOrdersYesterday) * 100;

      // Set the trend direction and sales difference
      setTrend(totalOrders >= totalOrdersYesterday ? 'up' : 'down');
      setDiff(Math.abs(ordersDiff));

      // Update the state with today's orders
      setOrders(totalOrders);
    });
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  // return (
  //   <TodayOrders value={`${orders}`} trend="up" diff={10} />
  // );
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={5}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={3}>
              <Typography color="text.secondary" variant="overline">
                Today's Orders
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <Typography variant="h2">{orders}</Typography>

          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff.toFixed(2)}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since yesterday
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

// export function TodayOrdersContainer() {
//   const [orders, setOrders] = useState(0);

//   useEffect(() => {
//     // Load and process the CSV file
//     d3.csv('/datasets/transactions_new.csv').then(function (data) {
//       // Extract date parts as YYYY-MM-DD strings
//       data.forEach((d: any) => {
//         d.date_only = d.created_at.split(' ')[0]; // assuming created_at is in the format 'YYYY-MM-DD HH:mm:ss'
//       });

//       // Find the latest date string in the dataset
//       const latestDate = d3.max(data, (d: any) => d.date_only);

//       // Filter transactions by the latest date string
//       const latestTransactions = data.filter((d: any) => d.date_only === latestDate);

//       // Calculate the total number of orders (transactions) for the latest date
//       const totalOrders = latestTransactions.length;

//       // Update the state with today's orders
//       setOrders(totalOrders);
//     });
//   }, []);

//   return (
//     <TodayOrders value={`${orders}`} trend="up" diff={10} />
//   );
//}
