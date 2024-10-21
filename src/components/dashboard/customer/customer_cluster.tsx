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

export interface CustomerClusterProps {
  sx?: SxProps;
}
 
export function CustomerCluster({ sx }: CustomerClusterProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/customer_segmentation.csv').then((data) => {
      const clusterData = processClusterData(data);
      setData(clusterData);
    });
  }, []);

  const processClusterData = (data: any[]) => {
    // Using d3.rollup to calculate count, average recency, frequency, and monetary values for each cluster
    const clusterMetrics = d3.rollup(
      data,
      (v) => {
        const count = v.length;
        const totalRecency = d3.sum(v, (d) => +d.Recency);
        const totalFrequency = d3.sum(v, (d) => +d.Frequency);
        const totalMonetary = d3.sum(v, (d) => +d.Monetary);

        return {
          count,
          avgRecency: totalRecency / count,
          avgFrequency: totalFrequency / count,
          avgMonetary: totalMonetary / count,
        };
      },
      (d) => d.Cluster
    );

    // Convert the result into an array
    return Array.from(clusterMetrics, ([Cluster, metrics]) => ({
      Cluster,
      count: metrics.count,
      avgRecency: metrics.avgRecency,
      avgFrequency: metrics.avgFrequency,
      avgMonetary: metrics.avgMonetary,
    }));
  };

  // Calculate total users for percentage calculation
  const totalUser = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
            Sync
          </Button>
        }
        title="Customer Cluster Demographic"
      />
      <CardContent>
        <ClusterTypography data={data} totalUser={totalUser} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterTypography({ data, totalUser }: { data: { Cluster: string; count: number; avgRecency: number; avgFrequency: number; avgMonetary: number }[]; totalUser: number }) {
  return (
    <Stack spacing={2}>
      {data.map((item) => {
        const percentage = ((item.count / totalUser) * 100).toFixed(2); // Calculate percentage

        return (
          <Stack key={item.Cluster} spacing={1}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {item.Cluster}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Count: {item.count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Percentage: {percentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Recency: {item.avgRecency.toFixed(0)} days
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Frequency: {item.avgFrequency.toFixed(0)} times
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Monetary: ${item.avgMonetary.toFixed(2)}
            </Typography>
            <Divider />
          </Stack>
        );
      })}
    </Stack>
  );
}
