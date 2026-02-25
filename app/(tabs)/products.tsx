import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BarberStore from "../../components/store/BarberStore";
import ClientStore from "../../components/store/Clientstore";
import Colors from "../../constants/colors";
import { API_URL } from "../../constants/config";

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

export default function ProductsScreen() {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!userStr || !token) {
        router.replace("/(auth)/login");
        return;
      }

      const user = JSON.parse(userStr);
      setRol(user.rol);

      // ✅ Cargar productos desde la API
      const response = await fetch(`${API_URL}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        router.replace("/(auth)/login");
        return;
      }

      const data = await response.json();
      setProducts(formatProducts(data));
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convertir formato de la BD al formato del componente
  const formatProducts = (data: any[]): Product[] => {
    return data.map((p) => ({
      id: String(p.id),
      name: p.nombre,
      description: p.descripcion || "",
      price: Number(p.precio),
      image:
        p.imagen ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nombre)}&background=D4AF37&color=1A1A1A&size=400`,
      category: (p.categoria as Product["category"]) || "otro",
      stock: Number(p.stock),
      sales: Number(p.ventas) || 0,
      rating: Number(p.rating_promedio) || 0,
      reviews: Number(p.total_reviews) || 0,
    }));
  };

  const getToken = async () => await AsyncStorage.getItem("token");

  // ✅ Barbero: Agregar producto
  const handleAddProduct = async (
    product: Omit<Product, "id" | "rating" | "reviews" | "sales">,
  ) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: product.name,
          descripcion: product.description,
          precio: product.price,
          categoria: product.category,
          stock: product.stock,
          imagen: product.image,
        }),
      });
      if (response.ok) await loadData();
    } catch {
      console.error("Error agregando producto");
    }
  };

  // ✅ Barbero: Editar producto
  const handleEditProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: updates.name,
          descripcion: updates.description,
          precio: updates.price,
          categoria: updates.category,
          stock: updates.stock,
          imagen: updates.image,
        }),
      });
      if (response.ok) await loadData();
    } catch {
      console.error("Error editando producto");
    }
  };

  // ✅ Barbero: Eliminar producto
  const handleDeleteProduct = async (id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) await loadData();
    } catch {
      console.error("Error eliminando producto");
    }
  };

  // ✅ Cliente: Comprar productos
  const handlePurchase = async (items: CartItem[]) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/productos/orden`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            producto_id: item.product.id,
            cantidad: item.quantity,
          })),
        }),
      });
      if (response.ok) await loadData(); // Recargar stock actualizado
    } catch {
      console.error("Error procesando compra");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {rol === "barbero" ? (
        <BarberStore
          products={products}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      ) : (
        <ClientStore products={products} onPurchase={handlePurchase} />
      )}
    </View>
  );
}
