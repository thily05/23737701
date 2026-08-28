import { PRICE_MULTIPLIER, STUDENT } from '@constants/student';

// 1. Định nghĩa các kiểu dữ liệu chuẩn
export type ProductCategory = 'food' | 'drink' | 'study';

export interface Product {
    id: number;
    title: string;
    price: number;
    formattedPrice: string;
    image: string;
    category: ProductCategory;
    description: string;
}

// 2. Hàm gọi API từ Fakestore
export async function fetchProducts(): Promise<Product[]> {
    // Gọi API lấy 8 sản phẩm
    const response = await fetch('https://fakestoreapi.com/products?limit=8');

    // Kiểm tra nếu gọi API thất bại (Ví dụ: tắt mạng)
    if (!response.ok) {
        throw new Error(`${STUDENT.mssv} - Không tải được dữ liệu món.`);
    }

    const data = await response.json();

    // Chuyển đổi dữ liệu từ API về dạng app CampusMart cần
    return data.map((item: any) => {
        // Quy tắc phân loại danh mục theo đề bài:
        // Chuỗi có 'clothing' -> Học tập; 'jewel' -> Nước; còn lại -> Đồ ăn
        let cat: ProductCategory = 'food';
        if (item.category.includes('clothing')) {
            cat = 'study';
        } else if (item.category.includes('jewel')) {
            cat = 'drink';
        }

        // Tính giá tiền: Math.round(price * PRICE_MULTIPLIER)
        const rawPrice = Math.round(item.price * PRICE_MULTIPLIER);

        return {
            id: item.id,
            title: item.title,
            price: rawPrice,
            // Định dạng tiền Việt: ví dụ "25.000 đ"
            formattedPrice: rawPrice.toLocaleString('vi-VN') + ' đ',
            image: item.image,
            category: cat,
            description: item.description,
        };
    });
}