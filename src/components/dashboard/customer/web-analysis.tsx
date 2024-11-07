'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Icon } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';

export interface WebAnalysisProps {
  sx?: SxProps;
}
 
export function WebAnalysis({ sx }: WebAnalysisProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/avg_web_session_customer.csv').then((data) => {
        const processedData = data.map((d) => ({
            Cluster: d.Cluster,
            PageView: d.page_view_count,
            SessionLength: d.session_length_in_sec,
          }));
        setData(processedData);

      // Set the first cluster as the default selected cluster
      if (processedData.length > 0) {
        setSelectedCluster(processedData[0].Cluster);
      }
    });
  }, []);

  // Handler to set the selected cluster
  const handleClusterSelect = (event: SelectChangeEvent<string>) => {
    setSelectedCluster(event.target.value);
  };

  // Filtered data based on selected cluster
  const filteredData = selectedCluster ? data.filter(item => item.Cluster === selectedCluster) : data;

  return (
    <Card sx={sx}>
      <CardHeader title="Web Analysis"
      action={
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="cluster-select-label">Select Cluster</InputLabel>
          <Select
            labelId="cluster-select-label"
            value={selectedCluster || ""}
            onChange={handleClusterSelect}
            label="Select Cluster"
          >
            {Array.from(new Set(data.map(item => item.Cluster))).map(cluster => (
              <MenuItem key={cluster} value={cluster}>
                {cluster}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      />
      <CardContent sx={{pt: 1}}>
        <ClusterWebTypography data={filteredData} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterWebTypography({ data }: { data: { Cluster: string; PageView: number; SessionLength: number }[] }) {
  return (
    <Grid>
      {data.map((item) => {
        return (
          <Card sx={{ height: '100%'}}>
            <CardContent>
            <Typography variant="body1" fontWeight="bold" color="text.secondary" sx={{mb: 2}}>
                {item.Cluster}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon color="primary" component={EyeIcon} sx={{mr: 1}}/>
            <Typography variant="body1" color="text.secondary">Pages Viewed</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary" sx={{mb: 2}}>
                {item.PageView} 
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon color="primary" component={ClockIcon} sx={{mr: 1}}/>
            <Typography variant="body1" color="text.secondary">Time Spent</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.SessionLength} seconds
            </Typography>
            </CardContent>
            </Card>
        );
      })}
    </Grid>
  );
}
