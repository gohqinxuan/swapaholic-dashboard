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
import { UsersThree as UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';

export interface TotalCustomersProps {
  sx?: SxProps;
  // selectedCluster: { count: number } | null;
}

export function TotalCustomers({ sx }: TotalCustomersProps): React.JSX.Element {
  // const [totalCustomers, setTotalCustomers] = useState(0);

  // useEffect(() => {
  //   if (!selectedCluster) {
  //     // Load and process the CSV file if no cluster is selected
  //     d3.csv('/datasets/customer_new.csv').then((data) => {
  //       const totalCustomers = data.length;
  //       setTotalCustomers(totalCustomers);
  //     });
  //   } else {
  //     // If a cluster is selected, set the total customers to the cluster count
  //     setTotalCustomers(selectedCluster.count);
  //   }
  // }, [selectedCluster]);
  const [customers, setCustomers] = useState(0);
  useEffect(() => {
    // Load and process the CSV file
    d3.csv('/datasets/customer_new.csv').then(function (data) {
      const totalcustomers = data.length;

      setCustomers(totalcustomers);
    });
  }, []);

  // Create a formatter to display numbers in human-readable format
  const formatCustomers = d3.format('~s'); // '~s' format will convert 100000 to '100k'

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={5}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={3}>
              <Typography color="text.secondary" variant="overline">
                Total Customers
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <UsersThreeIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <Typography variant="h2">{formatCustomers(customers)}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}