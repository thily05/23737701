import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    Pressable,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STUDENT, BANNER_IMAGE_ID, VARIANT, examStamp, FLASH_SECONDS } from '@constants/student';
import { useTheme } from '@contexts/ThemeContext';
import { useCountdown } from '@hooks/useCountdown';
import { fetchProducts, Product, ProductCategory } from '@services/productApi';
import { Typography } from '@components/ui/Typography';
import { ShopInput } from '@components/ui/ShopInput';
import { ShopButton } from '@components/ui/ShopButton';

type CategoryId = 'all' | ProductCategory;

type CartAction = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' };
function cartReducer(state: number, action: CartAction): number {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state > 1 ? state - 1 : 1;
        case 'RESET':
            return 1;
        default:
            return state;
    }
}

export const HomeScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { colors, toggleTheme, theme } = useTheme();
    const { formattedTime, isExpired } = useCountdown(FLASH_SECONDS);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState<number>(0);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [quantity, dispatchQuantity] = useReducer(cartReducer, 1);

    // Fetch API với Cleanup Flag (alive)
    useEffect(() => {
        let isAlive = true;
        setLoading(true);
        setError(null);

        fetchProducts()
            .then((data) => {
                if (isAlive) {
                    setProducts(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isAlive) {
                    setError(err.message || 'Lỗi tải dữ liệu món.');
                    setLoading(false);
                }
            });

        return () => {
            isAlive = false;
        };
    }, [reloadToken]);

    const handleRetry = () => {
        setReloadToken((prev) => prev + 1);
    };

    // Thứ tự 4 Chip theo MSSV cuối 1: Học tập -> Nước -> Đồ ăn -> Tất cả
    const categories = useMemo(() => {
        const base: Array<{ id: CategoryId; label: string }> = [
            { id: 'all', label: 'Tất cả' },
            { id: 'food', label: 'Đồ ăn' },
            { id: 'drink', label: 'Nước' },
            { id: 'study', label: 'Học tập' },
        ];
        return VARIANT.chipsReversed ? [...base].reverse() : base;
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const handleOpenModal = useCallback((product: Product) => {
        setSelectedProduct(product);
        dispatchQuantity({ type: 'RESET' });
        setModalVisible(true);
    }, []);

    const handleConfirmOrder = () => {
        if (!selectedProduct) return;
        if (isExpired) {
            Alert.alert('Thông báo', 'Hết giờ flash-sale!');
            return;
        }
        Alert.alert(
            `CampusMart · ${STUDENT.mssv}`,
            `${STUDENT.hoTen} (#${examStamp()}) đã ghi nhận: ${selectedProduct.title} × ${quantity}. Nhận tại quầy KTX.`
        );
        setModalVisible(false);
        dispatchQuantity({ type: 'RESET' });
    };

    const renderWatermark = () => (
        <View style={styles.watermarkContainer}>
            <Typography variant="caption" color={colors.textLight} style={styles.watermarkText}>
                TH1 · {STUDENT.mssv} · {STUDENT.hoTen} · #{examStamp()}
            </Typography>
        </View>
    );

    const renderHeader = useCallback(
        () => (
            <View style={styles.headerWrapper}>
                {/* Khối (A): Header Teal chuẩn Giao diện 1 */}
                <View
                    style={[
                        styles.headerBar,
                        {
                            backgroundColor: colors.primary,
                            paddingTop: Math.max(insets.top, 16) + 6,
                        },
                    ]}
                >
                    <View style={styles.headerLeft}>
                        <Typography variant="title" color="#FFFFFF" style={styles.brandTitle}>
                            CAMPUSMART
                        </Typography>
                        <Typography variant="body" color="rgba(255,255,255,0.85)" style={styles.brandSub}>
                            Tiện lợi KTX
                        </Typography>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                            style={[
                                styles.themeCapsuleBtn,
                                {
                                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                },
                            ]}
                        >
                            <Typography variant="button" color="#FFFFFF" style={styles.themeCapsuleText}>
                                {theme === 'dark' ? '🌙 Tối' : '☀️ Sáng'}
                            </Typography>
                        </TouchableOpacity>

                        <Typography variant="subtitle" color={colors.secondary} style={styles.flashTimerText}>
                            Flash {formattedTime}
                        </Typography>
                    </View>
                </View>

                {/* Khối (B): Ô tìm kiếm ShopInput */}
                <View style={styles.sectionContainer}>
                    <ShopInput
                        colors={colors}
                        placeholder={`Tìm món, nước, đồ dùng — ${STUDENT.mssv}`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInputCustom}
                    />
                </View>

                {/* Khối (C): Banner Đặt nhanh · Nhận tại quầy PICSUM */}
                <View style={styles.sectionContainer}>
                    <ImageBackground
                        source={{ uri: `https://picsum.photos/id/${BANNER_IMAGE_ID}/800/320` }}
                        style={styles.bannerImage}
                        imageStyle={styles.bannerImageRadius}
                        resizeMode="cover"
                    >
                        <View style={styles.bannerOverlay}>
                            <Typography variant="title" color="#FFFFFF" style={styles.bannerTitle}>
                                Đặt nhanh  ·  Nhận tại quầy
                            </Typography>
                            <Typography variant="body" color="rgba(255,255,255,0.95)" style={styles.bannerSub}>
                                Cửa hàng tiện lợi ký túc xá 24/7
                            </Typography>
                        </View>
                    </ImageBackground>
                </View>

                {/* Khối (D): 4 Chip bộ lọc */}
                <View style={styles.chipContainer}>
                    {categories.map((chip) => {
                        const isSelected = selectedCategory === chip.id;
                        return (
                            <Pressable
                                key={chip.id}
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: isSelected ? colors.primary : colors.surface,
                                        borderColor: colors.primary,
                                    },
                                ]}
                                onPress={() => setSelectedCategory(chip.id)}
                            >
                                <Typography
                                    variant="bodyMedium"
                                    color={isSelected ? '#FFFFFF' : colors.primary}
                                    style={styles.chipText}
                                >
                                    {chip.label}
                                </Typography>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        ),
        [colors, formattedTime, insets.top, searchQuery, selectedCategory, theme, toggleTheme, categories]
    );

    const renderItem = useCallback(
        ({ item }: { item: Product }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
                <View style={styles.cardInfo}>
                    <Typography variant="subtitle" color={colors.text} numberOfLines={1} style={styles.cardTitle}>
                        {item.title}
                    </Typography>
                    <Typography variant="price" color={colors.primary} style={styles.cardPrice}>
                        {item.formattedPrice}
                    </Typography>
                    <Typography variant="caption" color={colors.textLight}>
                        {item.category === 'food' ? 'Đồ ăn' : item.category === 'drink' ? 'Nước' : 'Học tập'}
                    </Typography>
                </View>
                <ShopButton
                    title="Đặt"
                    colors={colors}
                    onPress={() => handleOpenModal(item)}
                    style={styles.orderBtn}
                />
            </View>
        ),
        [colors, handleOpenModal]
    );

    // Cảnh 1: Đang tải
    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Typography variant="body" color={colors.primary} style={styles.loadingText}>
                    Đang tải món...
                </Typography>
            </View>
        );
    }

    // Cảnh 3: Lỗi mạng
    if (error) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <Typography variant="title" color="#DC2626" style={styles.errorMssv}>
                    {STUDENT.mssv}
                </Typography>
                <Typography variant="subtitle" color={colors.text} style={styles.errorMessage}>
                    {'Không tải được\ndữ liệu món.'}
                </Typography>
                <TouchableOpacity
                    onPress={handleRetry}
                    activeOpacity={0.8}
                    style={styles.errorRetryButton}
                >
                    <Typography variant="button" color="#FFFFFF" style={styles.errorRetryButtonText}>
                        Thử lại
                    </Typography>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 4) }]}>
            {VARIANT.watermarkAtTop && renderWatermark()}

            <FlatList
                data={filteredProducts}
                extraData={colors}
                keyExtractor={(item) => `${STUDENT.mssv}-${item.id}`}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Typography variant="bodyMedium" color={colors.textLight}>
                            Không có món phù hợp
                        </Typography>
                    </View>
                }
            />

            {!VARIANT.watermarkAtTop && renderWatermark()}

            {/* Modal Đặt Món */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType={VARIANT.modalAnimation}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Typography variant="caption" color={colors.textLight} style={styles.modalWatermark}>
                            TH1 · {STUDENT.mssv} · {STUDENT.hoTen} · #{examStamp()}
                        </Typography>

                        {selectedProduct && (
                            <>
                                <Image
                                    source={{ uri: selectedProduct.image }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />
                                <Typography variant="title" color={colors.text} style={styles.modalTitle}>
                                    {selectedProduct.title}
                                </Typography>
                                <Typography variant="price" color={colors.primary} style={styles.modalPrice}>
                                    {selectedProduct.formattedPrice}
                                </Typography>
                                <Typography variant="caption" color={colors.textLight} style={styles.modalCategory}>
                                    Danh mục:{' '}
                                    {selectedProduct.category === 'food'
                                        ? 'Đồ ăn'
                                        : selectedProduct.category === 'drink'
                                            ? 'Nước'
                                            : 'Học tập'}
                                </Typography>
                                <Typography
                                    variant="body"
                                    color={colors.textLight}
                                    numberOfLines={2}
                                    style={styles.modalDesc}
                                >
                                    {selectedProduct.description}
                                </Typography>

                                <View style={styles.counterRow}>
                                    <Pressable
                                        style={[styles.counterBtn, { borderColor: colors.border }]}
                                        onPress={() => dispatchQuantity({ type: 'DECREMENT' })}
                                    >
                                        <Typography variant="subtitle" color={colors.text}>-</Typography>
                                    </Pressable>
                                    <Typography variant="title" color={colors.text} style={styles.counterValue}>
                                        {quantity}
                                    </Typography>
                                    <Pressable
                                        style={[styles.counterBtn, { borderColor: colors.border }]}
                                        onPress={() => dispatchQuantity({ type: 'INCREMENT' })}
                                    >
                                        <Typography variant="subtitle" color={colors.text}>+</Typography>
                                    </Pressable>
                                </View>

                                <ShopButton
                                    title={isExpired ? 'Hết giờ flash-sale' : 'Xác nhận đặt'}
                                    colors={colors}
                                    disabled={isExpired}
                                    onPress={handleConfirmOrder}
                                    style={styles.confirmBtn}
                                />

                                <ShopButton
                                    title="Đóng"
                                    colors={colors}
                                    variant="outline"
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeBtn}
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    headerWrapper: {
        marginBottom: 8,
    },
    headerBar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'column',
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    brandSub: {
        fontSize: 13,
        marginTop: 2,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    themeCapsuleBtn: {
        paddingVertical: 5,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        marginBottom: 6,
        zIndex: 10,
    },
    themeCapsuleText: {
        fontSize: 13,
        fontWeight: '600',
    },
    flashTimerText: {
        fontSize: 14,
        fontWeight: '700',
    },
    sectionContainer: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    searchInputCustom: {
        borderRadius: 22,
        height: 44,
    },
    bannerImage: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bannerImageRadius: {
        borderRadius: 16,
    },
    bannerOverlay: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: 'rgba(15, 118, 110, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    bannerSub: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    chipContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 14,
        marginBottom: 8,
        gap: 8,
    },
    chip: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1.5,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardImage: {
        width: 68,
        height: 68,
        borderRadius: 12,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 14,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    orderBtn: {
        minHeight: 36,
        paddingHorizontal: 18,
        borderRadius: 18,
    },
    watermarkContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    watermarkText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    modalWatermark: {
        marginBottom: 8,
    },
    modalImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 4,
    },
    modalPrice: {
        marginBottom: 4,
    },
    modalCategory: {
        marginBottom: 8,
    },
    modalDesc: {
        textAlign: 'center',
        marginBottom: 16,
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    counterBtn: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterValue: {
        marginHorizontal: 20,
        fontSize: 20,
    },
    confirmBtn: {
        width: '100%',
        marginBottom: 10,
    },
    closeBtn: {
        width: '100%',
    },
    errorMssv: {
        fontSize: 16,
        fontWeight: '700',
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 6,
    },
    errorMessage: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    errorRetryButton: {
        backgroundColor: '#DC2626',
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 48,
        minWidth: 160,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    errorRetryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    loadingText: {
        marginTop: 14,
        fontSize: 15,
        fontWeight: '600',
    },
});