'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface CategoryAnalysisProps {
  sx?: SxProps;
}
 
export function CategoryAnalysis({ sx }: CategoryAnalysisProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/customer_segmentation_most_least_category.csv').then((data) => {
        const processedData = data.map((d) => ({
            Cluster: d.Cluster,
            MostPopular: d.Most_Popular_Category,
            LeastPopular: d.Least_Popular_Category,
          }));
        setData(processedData);
    });
  }, []);
  return (
    <Card sx={sx}>
      <CardHeader title="Category Analysis by Customer Cluster"/>
      <CardContent>
        <ClusterCatTypography data={data} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterCatTypography({ data }: { data: { Cluster: string; MostPopular: string; LeastPopular: string }[] }) {
  return (
    <Stack spacing={2}>
      {data.map((item) => {
        return (
          <Stack key={item.Cluster} spacing={1}>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.MostPopular}
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Most Popular Category
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.LeastPopular}
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Least Popular Category
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
