import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { config } from '@/config';
import { CustomerAge } from '@/components/dashboard/customer/customer-age';
import { CustomerGender } from '@/components/dashboard/customer/customer-gender';
import { CustomerLocation } from '@/components/dashboard/customer/customer-location';
import { CustomerCluster } from '@/components/dashboard/customer/customer-cluster';
import { CategoryAnalysis } from '@/components/dashboard/customer/category-analysis';
import { WebAnalysis } from '@/components/dashboard/customer/web-analysis';

export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {

  return (

      <Grid container spacing={3}>
        <Grid lg={12} sm={12} xs={12}>
            <Typography variant="h5" fontWeight="bold">CUSTOMER DEMOGRAPHIC</Typography>
        </Grid>
        <Grid lg={4} sm={12} xs={12}>
          <CustomerGender sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={8} sm={12} xs={12}>
          <CustomerAge sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={12} sm={12} xs={12}>
          <CustomerLocation sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={12} sm={12} xs={12}>
          <Typography variant="h5" fontWeight="bold">CUSTOMER BEHAVIOUR</Typography>
        </Grid>
        <Grid lg={12} xs={12}>
          <CustomerCluster sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={6} sm={6} xs={12}>
          <CategoryAnalysis sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={6} sm={6} xs={12}>
          <WebAnalysis sx={{ height: '100%' }} />
        </Grid>
      </Grid>

  );
}