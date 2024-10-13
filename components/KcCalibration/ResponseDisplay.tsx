"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ResponseDisplayProps {
  responseData: string | null;
}

// Ensure that this component is only used in a client-side context
export function ResponseDisplay({ responseData }: ResponseDisplayProps) {
  if (!responseData) return null;
  const data = JSON.parse(responseData);

  // Prepare data for Recharts
  const chartData = useMemo(() => {
    const kcValues = data[Object.keys(data)[0]].kc;
    return kcValues.map((kcValue: number, index: number) => {
      const point: { [key: string]: number } = { kc: kcValue };
      Object.keys(data).forEach((key) => {
        point[key] = data[key].q_median_one_up[index];
      });
      return point;
    });
  }, [responseData]);

  // Generate random colors for each line
  const colors = useMemo(
    () =>
      Object.keys(data).map(
        () => "#" + Math.floor(Math.random() * 16777215).toString(16)
      ),
    [data]
  );

  return (
    <div className="w-full mt-6 flex flex-col items-center">
      <ResponsiveContainer width="80%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="kc"
            label={{ value: "KC", position: "insideBottomRight", offset: -10 }}
          />
          <YAxis
            label={{
              value: "Q Median One Up",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
            }}
            itemStyle={{ color: "black" }}
            formatter={(value, name, props: any) => {
              const index = props.payload?.index ?? 0;
              const criticalDuration =
                data[props.dataKey].critical_duration[index];
              const pattern = data[props.dataKey].median_one_up_pattern[index];
              return `${value} \n(${criticalDuration}  s) \n ${pattern}`;
            }}
          />
          <Legend />
          {Object.keys(data).map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index]}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
