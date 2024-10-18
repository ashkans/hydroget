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

  // Use an extended colormap with more colors
  const colors = useMemo(() => {
    const extendedColormap = [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
      "#aec7e8",
      "#ffbb78",
      "#98df8a",
      "#ff9896",
      "#c5b0d5",
      "#c49c94",
      "#f7b6d2",
      "#c7c7c7",
      "#dbdb8d",
      "#9edae5",
      "#393b79",
      "#637939",
      "#8c6d31",
      "#843c39",
      "#7b4173",
      "#5254a3",
      "#8ca252",
      "#bd9e39",
      "#ad494a",
      "#a55194",
    ];
    return Object.keys(data).map(
      (_, index) => extendedColormap[index % extendedColormap.length]
    );
  }, [data]);

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
