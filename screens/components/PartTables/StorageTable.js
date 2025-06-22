import { View, Text, FlatList } from 'react-native';
import HoverableOpacity from '../HoverableOpacity';
import styles from './TableStyles';

export default function StorageTable({ options, onSelect, formatPrice, formatPriceDecimals }) {
  const renderItem = ({ item }) => {
    const size = parseFloat(item.capacity);
    const unit = item.unit || 'GB'; // Default to GB if missing
    const sizeInGB = unit === 'TB' ? size * 1024 : size;

    const price = item.price;
    const pricePerGB = price && sizeInGB ? price / sizeInGB : null;

    return (
      <HoverableOpacity
        onPress={() => onSelect(item)}
        outerStyle={styles.row}
        hoverStyle={styles.rowHovered}
      >
        <Text style={styles.cell}>{item.value || '—'}</Text>
        <Text style={styles.cell}>{item.capacity ? item.capacity + ' ' + unit : '—'}</Text>
        <Text style={styles.cell}>{pricePerGB ? formatPriceDecimals(pricePerGB) : '—'}</Text>
        <Text style={styles.cell}>{item.type || '—'}</Text>
        <Text style={styles.cell}>{item.form_factor || '—'}</Text>
        <Text style={styles.cell}>{price ? formatPrice(price) : '—'}</Text>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Capacity</Text>
        <Text style={styles.cellHeader}>Price / GB</Text>
        <Text style={styles.cellHeader}>Type</Text>
        <Text style={styles.cellHeader}>Form Factor</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList
        data={options}
        keyExtractor={(item) => item.id?.toString() || item.value}
        renderItem={renderItem}
      />
    </>
  );
}
