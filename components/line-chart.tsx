import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface LineChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  width: number;
  height?: number;
  backgroundColor?: string;
  gridColor?: string;
  labelColor?: string;
  title?: string;
  showDots?: boolean;
  showGrid?: boolean;
  showArea?: boolean;
}

export function LineChart({
  labels,
  datasets,
  width,
  height = 220,
  backgroundColor = 'transparent',
  gridColor = '#E5E7EB',
  labelColor = '#687076',
  title,
  showDots = true,
  showGrid = true,
  showArea = true,
}: LineChartProps) {
  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (labels.length === 0 || datasets.length === 0) {
    return null;
  }

  // Calcular min/max de todos os datasets
  const allValues = datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(0, ...allValues);
  const range = maxValue - minValue || 1;

  // Gerar linhas de grade Y
  const ySteps = 4;
  const yLines = Array.from({ length: ySteps + 1 }, (_, i) => {
    const value = minValue + (range * i) / ySteps;
    return Math.round(value);
  });

  // Converter dados em coordenadas
  const getX = (index: number) => {
    if (labels.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (labels.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return paddingTop + chartHeight - ((value - minValue) / range) * chartHeight;
  };

  // Gerar path SVG para cada dataset
  const generateLinePath = (data: number[]) => {
    if (data.length === 0) return '';
    if (data.length === 1) return '';

    let path = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      // Usar curvas suaves (bezier)
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1]);
      const currX = getX(i);
      const currY = getY(data[i]);
      const cpX = (prevX + currX) / 2;
      path += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
    }
    return path;
  };

  // Gerar path de área (preenchimento abaixo da linha)
  const generateAreaPath = (data: number[]) => {
    if (data.length < 2) return '';
    const linePath = generateLinePath(data);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = getY(minValue);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {title && (
        <Text style={[styles.title, { color: labelColor }]}>{title}</Text>
      )}
      <Svg width={width} height={height}>
        <Defs>
          {datasets.map((ds, idx) => (
            <LinearGradient
              key={`grad-${idx}`}
              id={`area-gradient-${idx}`}
              x1="0" y1="0" x2="0" y2="1"
            >
              <Stop offset="0" stopColor={ds.color} stopOpacity="0.25" />
              <Stop offset="1" stopColor={ds.color} stopOpacity="0.02" />
            </LinearGradient>
          ))}
        </Defs>

        {/* Grid horizontal */}
        {showGrid && yLines.map((value, i) => {
          const y = getY(value);
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={gridColor}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 4}
                fill={labelColor}
                fontSize={10}
                textAnchor="end"
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Áreas preenchidas */}
        {showArea && datasets.map((ds, idx) => {
          const areaPath = generateAreaPath(ds.data);
          if (!areaPath) return null;
          return (
            <Path
              key={`area-${idx}`}
              d={areaPath}
              fill={`url(#area-gradient-${idx})`}
            />
          );
        })}

        {/* Linhas */}
        {datasets.map((ds, idx) => {
          const linePath = generateLinePath(ds.data);
          if (!linePath) return null;
          return (
            <Path
              key={`line-${idx}`}
              d={linePath}
              stroke={ds.color}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Pontos */}
        {showDots && datasets.map((ds, idx) =>
          ds.data.map((value, i) => (
            <React.Fragment key={`dot-${idx}-${i}`}>
              <Circle
                cx={getX(i)}
                cy={getY(value)}
                r={4}
                fill="#fff"
                stroke={ds.color}
                strokeWidth={2}
              />
              {/* Valor acima do ponto */}
              <SvgText
                x={getX(i)}
                y={getY(value) - 10}
                fill={ds.color}
                fontSize={9}
                fontWeight="600"
                textAnchor="middle"
              >
                {value}
              </SvgText>
            </React.Fragment>
          ))
        )}

        {/* Labels do eixo X */}
        {labels.map((label, i) => (
          <SvgText
            key={`label-${i}`}
            x={getX(i)}
            y={height - 8}
            fill={labelColor}
            fontSize={9}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>

      {/* Legenda */}
      {datasets.length > 1 && (
        <View style={styles.legend}>
          {datasets.map((ds, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ds.color }]} />
              <Text style={[styles.legendText, { color: labelColor }]}>{ds.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
