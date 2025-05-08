import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Registro } from '../interfaces/interfaces';
import { ChartData } from './chartServices';

export default function MyBarChart({ data }: { data: Registro[] }) {
    const [processedData, setProcessedData] = useState();
    const chartService = useRef(null);

    useEffect(() => {
      chartService.current = new ChartData(data);
      setProcessedData(chartService.current.setMonthRange(3, 6).formatData().sumValor());
    }, [data]);
    
    return  <ResponsiveContainer width={"100%"} height={300}>
    <BarChart
      data={processedData}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="descricao" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="valor"
        fill="#B3CDAD"
        activeBar={<Rectangle fill="pink" stroke="blue" />}
      />
      <Bar
        dataKey="valorMenosInvestimento"
        fill="#B3CDAD"
        activeBar={<Rectangle fill="pink" stroke="blue" />}
      />
      <Bar
        dataKey="acumulado"
        fill="#5059c9"
        activeBar={<Rectangle fill="pink" stroke="blue" />}
      />
    </BarChart>
  </ResponsiveContainer>
}