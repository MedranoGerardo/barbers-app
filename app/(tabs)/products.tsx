/*import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BarberStore from "../../components/store/BarberStore";
import ClientStore from "../../components/store/Clientstore";

// DEFINICIÓN DE TIPOS
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "pomada" | "cera" | "gel" | "aceite" | "shampoo" | "otro";
  stock: number;
  sales: number;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// PROPS DEL COMPONENTE
interface ProductsScreenProps {
  userType: "barber" | "client";
}

export default function ProductsScreen({ userType }: ProductsScreenProps) {
  // Estado para los productos
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Pomada Strong Hold",
      description:
        "Fijación extrema para estilos audaces. Acabado brillante que dura todo el día.",
      price: 15.99,
      image:
        "https://ui-avatars.com/api/?name=Pomada&background=D4AF37&color=1A1A1A&size=400",
      category: "pomada",
      stock: 25,
      sales: 48,
      rating: 4.8,
      reviews: 127,
    },
    {
      id: "2",
      name: "Cera Mate Professional",
      description:
        "Acabado mate natural con fijación media. Perfecta para look casual.",
      price: 12.99,
      image:
        "https://ui-avatars.com/api/?name=Cera&background=8B7355&color=FFFFFF&size=400",
      category: "cera",
      stock: 18,
      sales: 35,
      rating: 4.6,
      reviews: 89,
    },
    {
      id: "3",
      name: "Gel Ultra Shine",
      description:
        "Gel de alto brillo para peinados clásicos. Secado rápido y larga duración.",
      price: 10.99,
      image:
        "https://ui-avatars.com/api/?name=Gel&background=4169E1&color=FFFFFF&size=400",
      category: "gel",
      stock: 32,
      sales: 62,
      rating: 4.5,
      reviews: 156,
    },
    {
      id: "4",
      name: "Aceite de Barba Premium",
      description:
        "Mezcla de aceites naturales para barba suave y brillante. Aroma masculino.",
      price: 18.99,
      image:
        "https://ui-avatars.com/api/?name=Aceite&background=8B4513&color=FFFFFF&size=400",
      category: "aceite",
      stock: 15,
      sales: 41,
      rating: 4.9,
      reviews: 203,
    },
    {
      id: "5",
      name: "Shampoo Revitalizante",
      description:
        "Limpieza profunda con ingredientes naturales. Para todo tipo de cabello.",
      price: 14.99,
      image:
        "https://ui-avatars.com/api/?name=Shampoo&background=00CED1&color=FFFFFF&size=400",
      category: "shampoo",
      stock: 28,
      sales: 55,
      rating: 4.7,
      reviews: 178,
    },
  ]);

  // ESTADO PARA CAMBIAR ENTRE VISTAS (para desarrollo)
  const [currentView, setCurrentView] = useState<"barber" | "client">(userType);

  // FUNCIONES PARA BARBEROS
  const handleAddProduct = (
    product: Omit<Product, "id" | "rating" | "reviews" | "sales">,
  ) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      sales: 0,
      rating: 0,
      reviews: 0,
    };
    setProducts([...products, newProduct]);
    console.log("Producto agregado:", newProduct);
  };

  const handleEditProduct = (id: string, updates: Partial<Product>) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, ...updates } : product,
      ),
    );
    console.log("Producto actualizado:", id, updates);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    console.log("Producto eliminado:", id);
  };

  // FUNCIONES PARA CLIENTES
  const handlePurchase = (items: CartItem[]) => {
    // Crear una copia del array de productos
    const updatedProducts = [...products];

    items.forEach((item) => {
      const productIndex = updatedProducts.findIndex(
        (p) => p.id === item.product.id,
      );
      if (productIndex !== -1) {
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          stock: updatedProducts[productIndex].stock - item.quantity,
          sales: updatedProducts[productIndex].sales + item.quantity,
        };
      }
    });

    setProducts(updatedProducts);
    console.log("Compra procesada:", items);
  };

  // Barra de navegación para desarrollo (solo visible en __DEV__)
  const DevBar = () => {
    if (!__DEV__) return null;

    return (
      <View style={devStyles.container}>
        <TouchableOpacity
          style={[
            devStyles.button,
            currentView === "barber" && devStyles.buttonActive,
          ]}
          onPress={() => setCurrentView("barber")}
        >
          <Text style={devStyles.buttonText}>👨‍💼 Vista Barber</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            devStyles.button,
            currentView === "client" && devStyles.buttonActive,
          ]}
          onPress={() => setCurrentView("client")}
        >
          <Text style={devStyles.buttonText}>👤 Vista Cliente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // RENDERIZAR SEGÚN LA VISTA SELECCIONADA
  return (
    <View style={{ flex: 1 }}>
      {}
      <DevBar />

      {}
      {currentView === "barber" ? (
        <BarberStore
          products={products}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      ) : (
        <Clientstore products={products} onPurchase={handlePurchase} />
      )}
    </View>
  );
}

// Estilos para la barra de desarrollo
const devStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 8,
    gap: 8,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#D4AF37", // Color acento
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
*/

import { useState } from "react";
import { View } from "react-native";
import ClientStore from "../../components/store/Clientstore";

// DEFINICIÓN DE TIPOS
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "pomada" | "cera" | "gel" | "aceite" | "shampoo" | "otro";
  stock: number;
  sales: number;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// PROPS DEL COMPONENTE
interface ProductsScreenProps {
  userType: "barber" | "client";
}

export default function ProductsScreen({ userType }: ProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Pomada Strong Hold",
      description:
        "Fijación extrema para estilos audaces. Acabado brillante que dura todo el día.",
      price: 15.99,
      image:
        "https://ui-avatars.com/api/?name=Pomada&background=D4AF37&color=1A1A1A&size=400",
      category: "pomada",
      stock: 25,
      sales: 48,
      rating: 4.8,
      reviews: 127,
    },
    {
      id: "2",
      name: "Cera Mate Professional",
      description:
        "Acabado mate natural con fijación media. Perfecta para look casual.",
      price: 12.99,
      image:
        "https://ui-avatars.com/api/?name=Cera&background=8B7355&color=FFFFFF&size=400",
      category: "cera",
      stock: 18,
      sales: 35,
      rating: 4.6,
      reviews: 89,
    },
    {
      id: "3",
      name: "Gel Ultra Shine",
      description:
        "Gel de alto brillo para peinados clásicos. Secado rápido y larga duración.",
      price: 10.99,
      image:
        "https://ui-avatars.com/api/?name=Gel&background=4169E1&color=FFFFFF&size=400",
      category: "gel",
      stock: 32,
      sales: 62,
      rating: 4.5,
      reviews: 156,
    },
    {
      id: "4",
      name: "Aceite de Barba Premium",
      description:
        "Mezcla de aceites naturales para barba suave y brillante. Aroma masculino.",
      price: 18.99,
      image:
        "https://ui-avatars.com/api/?name=Aceite&background=8B4513&color=FFFFFF&size=400",
      category: "aceite",
      stock: 15,
      sales: 41,
      rating: 4.9,
      reviews: 203,
    },
    {
      id: "5",
      name: "Shampoo Revitalizante",
      description:
        "Limpieza profunda con ingredientes naturales. Para todo tipo de cabello.",
      price: 14.99,
      image:
        "https://ui-avatars.com/api/?name=Shampoo&background=00CED1&color=FFFFFF&size=400",
      category: "shampoo",
      stock: 28,
      sales: 55,
      rating: 4.7,
      reviews: 178,
    },
    {
      id: "6",
      name: "Pomada Medium Hold",
      description: "Fijación media versátil. Ideal para estilos del día a día.",
      price: 13.99,
      image:
        "https://ui-avatars.com/api/?name=Pomada+M&background=DAA520&color=1A1A1A&size=400",
      category: "pomada",
      stock: 20,
      sales: 38,
      rating: 4.6,
      reviews: 95,
    },
    {
      id: "7",
      name: "Cera Texturizante",
      description:
        "Define y texturiza el cabello. Fácil de aplicar y remodelar.",
      price: 11.99,
      image:
        "https://ui-avatars.com/api/?name=Cera+T&background=A0522D&color=FFFFFF&size=400",
      category: "cera",
      stock: 8,
      sales: 29,
      rating: 4.4,
      reviews: 67,
    },
    {
      id: "8",
      name: "Aceite Capilar Nutritivo",
      description:
        "Nutre y repara el cabello dañado. Acabado sedoso sin grasa.",
      price: 16.99,
      image:
        "https://ui-avatars.com/api/?name=Aceite+C&background=CD853F&color=FFFFFF&size=400",
      category: "aceite",
      stock: 12,
      sales: 33,
      rating: 4.8,
      reviews: 142,
    },
  ]);

  // FUNCIONES PARA BARBEROS
  const handleAddProduct = (
    product: Omit<Product, "id" | "rating" | "reviews" | "sales">,
  ) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      sales: 0,
      rating: 0,
      reviews: 0,
    };
    setProducts([...products, newProduct]);
    console.log("Producto agregado:", newProduct);
  };

  const handleEditProduct = (id: string, updates: Partial<Product>) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, ...updates } : product,
      ),
    );
    console.log("Producto actualizado:", id, updates);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    console.log("Producto eliminado:", id);
  };

  // FUNCIONES PARA CLIENTES (no se usan pero las dejamos)
  const handlePurchase = (items: CartItem[]) => {
    console.log("Compra procesada:", items);
  };

  // RENDERIZAR SOLO BARBERSTORE SIEMPRE
  /*return (
    <View style={{ flex: 1 }}>
      <BarberStore
        products={products}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </View>
  );*/

  // RENDERIZAR SOLO CLIENTSTORE SIEMPRE
  return (
    <View style={{ flex: 1 }}>
      <ClientStore // ← AHORA USA ClientStore
        products={products}
        onPurchase={handlePurchase} // ← USA onPurchase (no onAddProduct)
      />
    </View>
  );
}
