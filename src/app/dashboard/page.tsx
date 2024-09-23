import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { TodayRevenue } from '@/components/dashboard/overview/today-revenue';
import { TodayOrders } from '@/components/dashboard/overview/today-orders';
import { PastRevenue } from '@/components/dashboard/overview/past-revenue';
import { RevenueDays } from '@/components/dashboard/overview/revenue-days';
import { MonthlyRevenue } from '@/components/dashboard/overview/monthly-revenue';
import { YearlyRevenue } from '@/components/dashboard/overview/yearly-revenue';
// import { Traffic } from '@/components/dashboard/overview/traffic';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TodayRevenue sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TodayOrders sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={6} md={12} xs={12}>
        <PastRevenue sx={{ height: '100%' }}/>
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
        <MonthlyRevenue sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <RevenueDays sx={{ height: '100%' }}/>
      </Grid>
      <Grid lg={12} xs={12}>
        <YearlyRevenue sx={{ height: '100%' }}/>
      </Grid>
    </Grid>
  );
}
