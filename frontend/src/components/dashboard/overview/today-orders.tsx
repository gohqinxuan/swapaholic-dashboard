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
    // Fetch the CSV data from the backend
    fetch('http://localhost:5000/csv/data?filename=customer_transaction_new.csv')
      .then((response) => response.json()) 
      .then((data) => {
        // Parse the CSV string into an array of objects
        const parsedData = d3.csvParse(data.data);

        // Extract date parts as YYYY-MM-DD
        parsedData.forEach((d: any) => {
          d.date_only = d.transaction_date;
        });

        // Find the latest date string in the dataset
        const latestDate = d3.max(parsedData, (d: any) => d.date_only);

        // Filter transactions by the latest date string
        const latestTransactions = parsedData.filter((d: any) => d.date_only === latestDate);

        // Calculate the total number of orders (transactions) for the latest date
        const totalOrders = latestTransactions.length;

        // Find the second latest date (yesterday)
        const secondLatestDate = d3.max(parsedData.filter((d: any) => d.date_only < latestDate), (d: any) => d.date_only);

        // Filter transactions by the second latest date string
        const secondLatestTransactions = parsedData.filter((d: any) => d.date_only === secondLatestDate);

        // Calculate the total number of orders (transactions) for the second latest date
        const totalOrdersYesterday = secondLatestTransactions.length;

        // Calculate the percentage difference
        const ordersDiff = ((totalOrders - totalOrdersYesterday) / totalOrdersYesterday) * 100;

        // Set the trend direction and sales difference
        setTrend(totalOrders >= totalOrdersYesterday ? 'up' : 'down');
        setDiff(Math.abs(ordersDiff));

        // Update the state with today's orders
        setOrders(totalOrders);
      })
      .catch((error) => {
        console.error('Error fetching CSV data:', error);
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
