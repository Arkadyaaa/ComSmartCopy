import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

import MotherboardTable from './PartTables/MotherboardTable';
import GpuTable from './PartTables/GPUTable';
import CpuTable from './PartTables/CPUTable';
import FanTable from './PartTables/FanTable';
import RamTable from './PartTables/RAMTable';
import PsuTable from './PartTables/PSUTable';
import StorageTable from './PartTables/StorageTable';
import CaseTable from './PartTables/CaseTable';
import DefaultTable from './PartTables/DefaultTable';

export default function PartPickerModal({
  visible,
  selectedPart,
  partOptions,
  onSelect,
  onClose,
}) {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatPrice = (price) => {
    const rounded = Math.round(price);
    const formattedNumber = rounded.toLocaleString();
    return price <= 0 ? '' : `₱${formattedNumber}`;
  };

  const formatPriceDecimals = (price) => {
    if (price <= 0 || isNaN(price)) return '';
    return price.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSelect = (item) => {
    onSelect(selectedPart.label, item);
    handleClose();
  };

  const componentMap = {
    MOTHERBOARD: MotherboardTable,
    GPU: GpuTable,
    CPU: CpuTable,
    FAN: FanTable,
    RAM: RamTable,
    PSU: PsuTable,
    STORAGE: StorageTable,
    CASE: CaseTable,
  };

  const label = selectedPart?.label;
  const TableComponent = componentMap[label] || DefaultTable;
  const options = partOptions[label] || [];

  const filteredOptions = useMemo(() => {
    return options.filter((item) =>
      (item.value || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
  const paginatedOptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOptions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOptions, currentPage]);

  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleClose = () => {
    setSearchText('');
    setCurrentPage(1);
    setPageInput('1');
    onClose();
  };


  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.title}>{label}</Text>

          <TextInput
            placeholder="Search..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setCurrentPage(1);
            }}
            style={styles.searchInput}
          />

          <TableComponent
            options={paginatedOptions}
            onSelect={handleSelect}
            formatPrice={formatPrice}
            formatPriceDecimals={formatPriceDecimals}
          />

          {filteredOptions.length === 0 && (
            <Text style={{ textAlign: 'center', marginVertical: 10 }}>
              No items found.
            </Text>
          )}

          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={styles.pageButton}
            >
              <Text>{'«'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToPrevPage}
              disabled={currentPage <= 1}
              style={styles.pageButton}
            >
              <Text>{'←'}</Text>
            </TouchableOpacity>

            <Text>Page</Text>

            <TextInput
              style={styles.pageInput}
              keyboardType="numeric"
              value={pageInput}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) {
                  setPageInput(text);
                }
              }}
              onBlur={() => {
                const pageNum = parseInt(pageInput, 10);
                if (!isNaN(pageNum)) {
                  const clampedPage = Math.min(Math.max(1, pageNum), totalPages);
                  setCurrentPage(clampedPage);
                  setPageInput(clampedPage.toString());
                } else {
                  setPageInput(currentPage.toString());
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Enter') {
                  const pageNum = parseInt(pageInput, 10);
                  if (!isNaN(pageNum)) {
                    const clampedPage = Math.min(Math.max(1, pageNum), totalPages);
                    setCurrentPage(clampedPage);
                    setPageInput(clampedPage.toString());
                  }
                }
              }}
            />

            <Text>of {totalPages}</Text>

            <TouchableOpacity
              onPress={goToNextPage}
              disabled={currentPage >= totalPages}
              style={styles.pageButton}
            >
              <Text>{'→'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={styles.pageButton}
            >
              <Text>{'»'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  container: {
    margin: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    flex: 1,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  pageInput: {
    width: 40,
    height: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  closeText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
