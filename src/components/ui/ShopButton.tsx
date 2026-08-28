import React, { memo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

import { COLORS, SIZES } from '@constants/theme';
import { Typography } from '@components/ui/Typography';
import { ThemeColors } from '@contexts/ThemeContext';

type ShopButtonVariant = 'primary' | 'outline';

export interface ShopButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    variant?: ShopButtonVariant;
    style?: StyleProp<ViewStyle>;
    colors?: ThemeColors;
}

export const ShopButton = memo(
    ({
        title,
        onPress,
        isLoading = false,
        disabled = false,
        variant = 'primary',
        style,
        colors,
    }: ShopButtonProps) => {
        const isDisabled = disabled || isLoading;
        const isPrimary = variant === 'primary';

        const primaryBg = colors?.primary || COLORS.primary;
        const surfaceBg = colors?.surface || COLORS.surface;
        const borderColor = colors?.primary || COLORS.primary;

        const buttonBg = isPrimary ? primaryBg : surfaceBg;
        const textColor = isPrimary ? '#FFFFFF' : primaryBg;

        return (
            <Pressable
                onPress={onPress}
                disabled={isDisabled}
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: buttonBg,
                        borderColor: borderColor,
                        borderWidth: isPrimary ? 0 : 1,
                    },
                    pressed && !isDisabled ? styles.pressed : null,
                    isDisabled ? styles.disabled : null,
                    style,
                ]}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={textColor}
                        />
                        <Typography
                            variant="button"
                            color={textColor}>
                            {title}
                        </Typography>
                    </View>
                ) : (
                    <Typography
                        variant="button"
                        color={textColor}>
                        {title}
                    </Typography>
                )}
            </Pressable>
        );
    },
);

ShopButton.displayName = 'ShopButton';

const styles = StyleSheet.create({
    button: {
        minHeight: SIZES.buttonHeight,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pressed: {
        opacity: 0.8,
    },

    disabled: {
        opacity: 0.5,
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.sm,
    },
});