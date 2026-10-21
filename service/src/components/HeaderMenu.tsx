import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Modal } from 'react-native';
import { colors } from '../theme/tokens';

export function HeaderMenu() {
  const [visible, setVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  const menuItems = [
    { id: 'purchase-history', label: '구매내역' },
    { id: 'wallet', label: 'TOTT 지갑' },
    { id: 'guide', label: '이용 안내' },
  ];

  const handleMenuPress = (id: string) => {
    setSelectedMenu(id);
  };

  const handleClose = () => {
    setSelectedMenu(null);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdown}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => handleMenuPress(item.id)} style={styles.menuItem}>
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setVisible(false)} style={styles.menuItem}>
            <Text style={styles.menuText}>닫기</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!selectedMenu} transparent onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {menuItems.find((m) => m.id === selectedMenu)?.label}
            </Text>
            <Text style={styles.modalMessage}>PR-C에서 구현 예정입니다.</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: colors.paper,
    fontSize: 24,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: colors.ink,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 150,
    zIndex: 1000,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuText: {
    color: colors.paper,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    padding: 24,
    minWidth: 280,
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    color: colors.paper,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
