import React, { memo } from 'react';
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';

import { COLORS, SIZES } from '@constants/theme';
import { Typography } from '@components/ui/Typography';
import { ThemeColors } from '@contexts/ThemeContext';

export interface ShopInputProps
    extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    value: string;
    onChangeText: (text: string) => void;
    label?: string;
    error?: string;
    colors?: ThemeColors;
    containerStyle?: StyleProp<ViewStyle>;
}

export const ShopInput = memo(
    ({
        value,
        onChangeText,
        label,
        error,
        placeholder,
        colors,
        containerStyle,
        style,
        ...rest
    }: ShopInputProps) => {
        const textColor = colors?.text || COLORS.text;
        const placeholderColor = colors?.textLight || COLORS.textLight;
        const surfaceBg = colors?.surface || COLORS.surface;
        const borderColor = error ? (colors?.error || COLORS.error) : (colors?.border || COLORS.border);

        return (
            <View style={[styles.container, containerStyle]}>
                {label ? (
                    <Typography
                        variant="bodyMedium"
                        color={textColor}
                        style={styles.label}>
                        {label}
                    </Typography>
                ) : null}

                <TextInput
                    {...rest}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    style={[
                        styles.input,
                        {
                            backgroundColor: surfaceBg,
                            borderColor: borderColor,
                            color: textColor,
                        },
                        style,
                    ]}
                />

                {error ? (
                    <Typography
                        variant="caption"
                        color={colors?.error || COLORS.error}
                        style={styles.errorText}>
                        {error}
                    </Typography>
                ) : null}
            </View>
        );
    },
);

ShopInput.displayName = 'ShopInput';

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },

    label: {
        marginBottom: SIZES.sm,
    },

    input: {
        height: SIZES.inputHeight,
        borderWidth: 1,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
    },

    errorText: {
        marginTop: SIZES.xs,
    },
});