'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface CustomerClusterWebProps {
  sx?: SxProps;
}
 
export function CustomerClusterWeb({ sx }: CustomerClusterWebProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/avg_web_session_customer.csv').then((data) => {
        const processedData = data.map((d) => ({
            Cluster: d.Cluster,
            PageView: d.page_view_count,
            SessionLength: d.session_length_in_sec,
          }));
        setData(processedData);
    });
  }, []);
  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
            Sync
          </Button>
        }
        title="Web Analysis by Customer Cluster"
      />
      <CardContent>
        <ClusterWebTypography data={data} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterWebTypography({ data }: { data: { Cluster: string; PageView: number; SessionLength: number }[] }) {
  return (
    <Stack spacing={2}>
      {data.map((item) => {
        return (
          <Stack key={item.Cluster} spacing={1}>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.PageView} <Typography variant="body1" color="text.secondary"> pages viewed </Typography>
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.SessionLength} <Typography variant="body1" color="text.secondary"> seconds spent on the website </Typography>
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="text.secondary">
                {item.Cluster}
            </Typography>
            <Divider />
          </Stack>
        );
      })}
    </Stack>
  );
}
