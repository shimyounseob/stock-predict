import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

// 동적 로드로 ApexCharts 가져오기
const ApexChart = dynamic(() => import('react-apexcharts').then((mod) => mod.default), { ssr: false });

interface StockChartProps {
  data: Array<{ date: string; open: number; high: number; low: number; close: number }>;
}

export default function StockChart({ data }: StockChartProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const seriesData = data.map((day) => ({
      x: new Date(day.date),
      y: [day.open, day.high, day.low, day.close],
    }));

    setChartData({
      series: [
        {
          name: 'Price',
          data: seriesData,
        },
      ],
      options: {
        chart: {
          type: 'candlestick',
          height: 350,
        },
        xaxis: {
          type: 'datetime',
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
      },
    });
  }, [data]);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <Box>
      <ApexChart options={chartData.options} series={chartData.series} type="candlestick" height={350} />
    </Box>
  );
}
