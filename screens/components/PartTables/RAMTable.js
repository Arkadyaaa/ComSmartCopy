import { View, Text, FlatList } from 'react-native';
import HoverableOpacity from '../HoverableOpacity';
import styles from './TableStyles';

export default function RamTable({ options, onSelect, formatPrice, formatPriceDecimals }) {
  const renderItem = ({ item }) => {
    const sizeInGB = parseFloat(item.size);
    const price = item.price;
    const pricePerGB = price && sizeInGB ? price / sizeInGB : null;

    const stickCount = item.stick || 1;
    const sizePerStick = sizeInGB / stickCount;

    return (
      <HoverableOpacity
        onPress={() => onSelect(item)}
        outerStyle={styles.row}
        hoverStyle={styles.rowHovered}
      >
        <Text style={styles.cell}>{item.value || '—'}</Text>
        <Text style={styles.cell}>{item.speed || '—'}</Text>
        <Text style={styles.cell}>{item.size + 'GB (' + sizePerStick + "GB x " + stickCount + ')' || '—'}</Text>
        <Text style={styles.cell}>{pricePerGB ? formatPriceDecimals(pricePerGB) : '—'}</Text>
        <Text style={styles.cell}>{price ? formatPrice(price) : '—'}</Text>
      </HoverableOpacity>
    );
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Speed</Text>
        <Text style={styles.cellHeader}>Size</Text>
        <Text style={styles.cellHeader}>Price per GB</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList
        data={options}
        keyExtractor={(item) => item.id?.toString() || item.name}
        renderItem={renderItem}
      />
    </>
  );
}
