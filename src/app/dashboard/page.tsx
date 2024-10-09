import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { TodaySales } from '@/components/dashboard/overview/today-sales';
import { TodayOrders } from '@/components/dashboard/overview/today-orders';
import { PastSales } from '@/components/dashboard/overview/past-sales';
import { SalesDays } from '@/components/dashboard/overview/sales-days';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { MonthlySales } from '@/components/dashboard/overview/monthly-sales';
import { YearlySales } from '@/components/dashboard/overview/yearly-sales';
// import { Traffic } from '@/components/dashboard/overview/traffic';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TodaySales sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TodayOrders sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={6} md={12} xs={12}>
        <PastSales sx={{ height: '100%' }}/>
      </Grid>
      {/* <Grid lg={6} md={12} xs={12}>
        <LatestOrders
          orders={[
            {
              id: 'ORD-007',
              customer: { name: 'Ekaterina Tankova' },
              amount: 30.5,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-006',
              customer: { name: 'Cao Yu' },
              amount: 25.1,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-004',
              customer: { name: 'Alexa Richardson' },
              amount: 10.99,
              status: 'refunded',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid> */}
      <Grid lg={8} xs={12}>
        <MonthlySales sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <SalesDays sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={12} xs={12}>
        <YearlySales sx={{ height: '100%' }}/>
      </Grid>
    </Grid>
  );
}
