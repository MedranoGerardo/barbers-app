import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";

interface Product {
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

interface BarberStoreProps {
  products: Product[];
  onAddProduct?: (
    product: Omit<Product, "id" | "sales" | "rating" | "reviews">,
  ) => void;
  onEditProduct?: (id: string, product: Partial<Product>) => void;
  onDeleteProduct?: (id: string) => void;
}

export default function BarberStore({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: BarberStoreProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "sales">(
    "name",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // ✅ Estado local para precios (evita llamadas a la API por cada tecla)
  const [localPrices, setLocalPrices] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    // Sincronizar precios locales cuando cambian los productos
    const prices: { [id: string]: string } = {};
    products.forEach((p) => {
      prices[p.id] = p.price.toString();
    });
    setLocalPrices(prices);
  }, [products]);

  const categories = [
    { id: "all", label: "Todos", icon: "grid" },
    { id: "pomada", label: "Pomadas", icon: "sparkles" },
    { id: "cera", label: "Ceras", icon: "cut" },
    { id: "gel", label: "Geles", icon: "water" },
    { id: "aceite", label: "Aceites", icon: "leaf" },
    { id: "shampoo", label: "Shampoos", icon: "snow" },
    { id: "otro", label: "Otros", icon: "ellipsis-horizontal" },
  ];

  const getSortedProducts = () => {
    let filtered = products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        case "sales":
          comparison = a.sales - b.sales;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const filteredProducts = getSortedProducts();

  const totalInventory = products.reduce((sum, p) => sum + p.stock, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.sales, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const handleQuickStockUpdate = (productId: string, newStock: number) => {
    if (newStock < 0) {
      Alert.alert("Error", "El stock no puede ser negativo");
      return;
    }
    onEditProduct?.(productId, { stock: newStock });
  };

  // ✅ Solo guarda el precio cuando el usuario termina de escribir (onBlur)
  const handlePriceBlur = (productId: string) => {
    const newPrice = parseFloat(localPrices[productId]);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert("Error", "El precio debe ser mayor a 0");
      // Restaurar precio original
      const original = products.find((p) => p.id === productId);
      if (original)
        setLocalPrices((prev) => ({
          ...prev,
          [productId]: original.price.toString(),
        }));
      return;
    }
    onEditProduct?.(productId, { price: newPrice });
  };

  const handleSortPress = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection(field === "sales" ? "desc" : "asc");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Tienda</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} productos • Gestión de inventario
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setSelectedProduct(null);
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ESTADÍSTICAS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
      >
        <View style={styles.statsContainer}>
          {[
            {
              icon: "cube",
              color: Colors.accent,
              bg: "rgba(212,175,55,0.15)",
              value: totalInventory,
              label: "En Stock",
            },
            {
              icon: "trending-up",
              color: "#34C759",
              bg: "rgba(52,199,89,0.15)",
              value: totalSales,
              label: "Vendidos",
            },
            {
              icon: "cash",
              color: "#FF9500",
              bg: "rgba(255,149,0,0.15)",
              value: `$${totalRevenue.toFixed(0)}`,
              label: "Ingresos",
            },
            {
              icon: "pricetag",
              color: "#007AFF",
              bg: "rgba(0,122,255,0.15)",
              value: `$${totalValue.toFixed(0)}`,
              label: "Valor inventario",
            },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View
                style={[styles.statIconContainer, { backgroundColor: stat.bg }]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={20}
                  color={stat.color}
                />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos por nombre..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ORDENAR */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sortButtons}>
            {(["name", "price", "stock", "sales"] as const).map((field) => (
              <TouchableOpacity
                key={field}
                style={[
                  styles.sortButton,
                  sortBy === field && styles.sortButtonActive,
                ]}
                onPress={() => handleSortPress(field)}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === field && styles.sortButtonTextActive,
                  ]}
                >
                  {
                    {
                      name: "Nombre",
                      price: "Precio",
                      stock: "Stock",
                      sales: "Ventas",
                    }[field]
                  }
                  {sortBy === field && (sortDirection === "asc" ? " ↑" : " ↓")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* CATEGORÍAS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              activeCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={
                activeCategory === category.id
                  ? Colors.textPrimary
                  : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.label}
            </Text>
            {activeCategory === category.id && (
              <TouchableOpacity onPress={() => setActiveCategory("all")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA DE PRODUCTOS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productBadges}>
                    {product.stock < 5 && (
                      <View style={styles.lowStockBadge}>
                        <Ionicons name="warning" size={12} color="#FF9500" />
                        <Text style={styles.lowStockText}>Bajo stock</Text>
                      </View>
                    )}
                    {product.sales > 50 && (
                      <View style={styles.bestSellerBadge}>
                        <Ionicons name="star" size={12} color={Colors.accent} />
                        <Text style={styles.bestSellerText}>Best seller</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>

                <View style={styles.productStats}>
                  {/* PRECIO - ✅ guarda solo al perder foco */}
                  <View style={styles.statRow}>
                    <Ionicons name="pricetag" size={14} color={Colors.accent} />
                    <Text style={styles.statLabel}>Precio:</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={
                        localPrices[product.id] ?? product.price.toString()
                      }
                      keyboardType="decimal-pad"
                      onChangeText={(text) =>
                        setLocalPrices((prev) => ({
                          ...prev,
                          [product.id]: text,
                        }))
                      }
                      onBlur={() => handlePriceBlur(product.id)}
                    />
                  </View>

                  {/* STOCK */}
                  <View style={styles.statRow}>
                    <Ionicons name="cube" size={14} color="#34C759" />
                    <Text style={styles.statLabel}>Stock:</Text>
                    <View style={styles.stockControl}>
                      <TouchableOpacity
                        onPress={() =>
                          handleQuickStockUpdate(product.id, product.stock - 1)
                        }
                        style={styles.stockBtn}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={Colors.textPrimary}
                        />
                      </TouchableOpacity>
                      <Text style={styles.stockValue}>{product.stock}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleQuickStockUpdate(product.id, product.stock + 1)
                        }
                        style={styles.stockBtn}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={Colors.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.statRow}>
                    <Ionicons name="trending-up" size={14} color="#FF9500" />
                    <Text style={styles.statLabel}>Ventas:</Text>
                    <Text style={styles.salesValue}>{product.sales}</Text>
                  </View>

                  <View style={styles.statRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.statLabel}>Rating:</Text>
                    <Text style={styles.ratingValue}>
                      {product.rating.toFixed(1)} ({product.reviews})
                    </Text>
                  </View>
                </View>

                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => {
                      setSelectedProduct(product);
                      setShowAddModal(true);
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={Colors.accent}
                    />
                    <Text style={styles.actionBtnEditText}>Editar todo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    onPress={() =>
                      Alert.alert(
                        "Eliminar Producto",
                        `¿Estás seguro de eliminar "${product.name}"?`,
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: () => onDeleteProduct?.(product.id),
                          },
                        ],
                      )
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={styles.actionBtnDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="cube-outline"
                size={64}
                color={Colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? `No se encontraron productos con "${searchQuery}"`
                : "Agrega tu primer producto usando el botón +"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => {
                  setSelectedProduct(null);
                  setShowAddModal(true);
                }}
              >
                <Ionicons name="add" size={20} color={Colors.textPrimary} />
                <Text style={styles.emptyAddBtnText}>Agregar producto</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL AGREGAR/EDITAR */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedProduct(null);
                }}
              >
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ProductForm
              product={selectedProduct}
              onSubmit={(productData) => {
                if (selectedProduct) {
                  onEditProduct?.(selectedProduct.id, productData);
                } else {
                  onAddProduct?.(productData);
                }
                setShowAddModal(false);
                setSelectedProduct(null);
              }}
              onCancel={() => {
                setShowAddModal(false);
                setSelectedProduct(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProductForm({
  product,
  onSubmit,
  onCancel,
}: {
  product: Product | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "pomada" as Product["category"],
    stock: "",
    image: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.image,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "pomada",
        stock: "",
        image: "",
      });
    }
  }, [product]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre del producto es obligatorio");
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Ingresa un precio válido mayor a 0");
      return;
    }
    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      Alert.alert("Error", "Ingresa un stock válido (0 o más)");
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      category: formData.category,
      stock,
      image:
        formData.image.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=D4AF37&color=1A1A1A&size=200`,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Nombre <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Pomada Ultra Hold"
          placeholderTextColor={Colors.textSecondary}
          value={formData.name}
          onChangeText={(t) => setFormData({ ...formData, name: t })}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el producto..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={3}
          value={formData.description}
          onChangeText={(t) => setFormData({ ...formData, description: t })}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoryGrid}>
          {(
            [
              "pomada",
              "cera",
              "gel",
              "aceite",
              "shampoo",
              "otro",
            ] as Product["category"][]
          ).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryOption,
                formData.category === cat && styles.categoryOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, category: cat })}
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  formData.category === cat && styles.categoryOptionTextActive,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>
            Precio ($) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="decimal-pad"
            value={formData.price}
            onChangeText={(t) => setFormData({ ...formData, price: t })}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>
            Stock <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="number-pad"
            value={formData.stock}
            onChangeText={(t) => setFormData({ ...formData, stock: t })}
          />
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>URL de imagen (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://ejemplo.com/imagen.jpg"
          placeholderTextColor={Colors.textSecondary}
          value={formData.image}
          onChangeText={(t) => setFormData({ ...formData, image: t })}
        />
        <Text style={styles.hint}>
          Si no se proporciona, se generará una imagen automática
        </Text>
      </View>
      <View style={styles.modalActions}>
        <TouchableOpacity style={styles.modalBtnCancel} onPress={onCancel}>
          <Text style={styles.modalBtnCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalBtnSubmit} onPress={handleSubmit}>
          <Text style={styles.modalBtnSubmitText}>
            {product ? "Actualizar" : "Agregar"} Producto
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: Colors.textPrimary },
  headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  statsScroll: { maxHeight: 100, marginBottom: 15 },
  statsContainer: { flexDirection: "row", paddingHorizontal: 20, gap: 10 },
  statCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
    minWidth: 140,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: "bold", color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  sortContainer: { marginHorizontal: 20, marginBottom: 10 },
  sortLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
  sortButtons: { flexDirection: "row", gap: 8 },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
  },
  sortButtonActive: { backgroundColor: Colors.accent },
  sortButtonText: { fontSize: 12, color: Colors.textSecondary },
  sortButtonTextActive: { color: Colors.textPrimary },
  categoriesContainer: { paddingHorizontal: 20, paddingBottom: 15, gap: 8 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: { backgroundColor: Colors.accent },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  categoryChipTextActive: { color: Colors.textPrimary },
  productsList: { paddingHorizontal: 20, paddingBottom: 20 },
  productCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  productInfo: { flex: 1, marginLeft: 12 },
  productHeader: { marginBottom: 4 },
  productName: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },
  productBadges: { flexDirection: "row", marginTop: 4, gap: 4 },
  lowStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,149,0,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  lowStockText: { fontSize: 10, fontWeight: "600", color: "#FF9500" },
  bestSellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  bestSellerText: { fontSize: 10, fontWeight: "600", color: Colors.accent },
  productDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  productStats: { marginBottom: 10 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  priceInput: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
    padding: 0,
    minWidth: 60,
  },
  stockControl: { flexDirection: "row", alignItems: "center", gap: 8 },
  stockBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stockValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    minWidth: 25,
    textAlign: "center",
  },
  salesValue: { fontSize: 14, fontWeight: "600", color: "#34C759" },
  ratingValue: { fontSize: 12, color: Colors.textSecondary },
  productActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionBtnEdit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    gap: 4,
  },
  actionBtnEditText: { fontSize: 13, fontWeight: "600", color: Colors.accent },
  actionBtnDelete: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,59,48,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.3)",
    gap: 4,
  },
  actionBtnDeleteText: { fontSize: 13, fontWeight: "600", color: "#FF3B30" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    gap: 8,
  },
  emptyAddBtnText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: Colors.textPrimary },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: "row" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  required: { color: "#FF3B30" },
  hint: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categoryOptionActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  categoryOptionTextActive: { color: Colors.textPrimary },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  modalBtnCancelText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalBtnSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: "center",
  },
  modalBtnSubmitText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
