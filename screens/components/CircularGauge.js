import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function Gauge({
  label,
  value,
  limit,
  max,
  size = 160,
  isPrice = false,
  isBenchmark = false,
  invertColor = false,
  displayMax = false,
}) {
  // Percentages for value and limit
  const percentage = useMemo(() => Math.min((value / max) * 100, 100), [value, max]);
  const limitPercentage = useMemo(() => Math.min((limit / max) * 100, 100), [limit, max]);

  // Determine color based on value vs limit
  const isOverLimit = value > limit;
  const isNearLimit = value > limit * 0.8 && value <= limit;

  const getColor = () => {
    if (invertColor) {
      if (value >= limit) return COLORS.success;
      if (value >= limit * 0.6) return COLORS.warning;
      return COLORS.destructive;
    }
    if (isOverLimit) return COLORS.destructive;
    if (isNearLimit) return COLORS.warning;
    return COLORS.primary;
  };

  const formatValue = (num) => (isPrice ? formatPrice(num) : num.toLocaleString());

  const formatPrice = (price) => {
    const rounded = Math.round(price);
    const formattedNumber = rounded.toLocaleString();
    return price <= 0 ? '' : `₱${formattedNumber}`;
  };

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const limitOffset = circumference - (limitPercentage / 100) * circumference;

  const color = getColor();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label?.toUpperCase() || ''}</Text>

      <View style={{ width: size, height: size, marginVertical: 8 }}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#D1D5DB" // muted background
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Limit Indicator */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#9CA3AF" // muted limit
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={limitOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2},${size / 2}`}
          />

          {/* Value Arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2},${size / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={[StyleSheet.absoluteFillObject, styles.centerContent]}>
          <Text style={[styles.valueText, { color }]}>{formatValue(value)}</Text>
          {displayMax && <Text style={styles.maxText}>/ {formatValue(max)}</Text>}
        </View>
      </View>

      {/* Limit label */}
      <Text style={styles.limitText}>
        {isPrice ? 'Budget: ' : isBenchmark ? 'Target: ' : limit ? 'Limit: ' : 'No PSU'}
        {isPrice || isBenchmark || limit ? formatValue(limit) : ''}
      </Text>
    </View>
  );
}

const COLORS = {
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#FBBF24',
  destructive: '#EF4444',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  maxText: {
    fontSize: 12,
    color: '#6B7280',
  },
  limitText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
