import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

interface CartItem {
  product: Product;
  quantity: number;
}

interface ClientStoreProps {
  products: Product[];
  onPurchase?: (items: CartItem[]) => void;
}

export default function ClientStore({
  products,
  onPurchase,
}: ClientStoreProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  const categories = [
    { id: "all", label: "Todos", icon: "grid" },
    { id: "pomada", label: "Pomadas", icon: "sparkles" },
    { id: "cera", label: "Ceras", icon: "cut" },
    { id: "gel", label: "Geles", icon: "water" },
    { id: "aceite", label: "Aceites", icon: "leaf" },
    { id: "shampoo", label: "Shampoos", icon: "snow" },
    { id: "otro", label: "Otros", icon: "ellipsis-horizontal" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        Alert.alert("Stock insuficiente", "No hay suficiente stock disponible");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      if (quantity > product.stock) {
        Alert.alert("Stock insuficiente", "No hay suficiente stock disponible");
        return;
      }
      setCart([...cart, { product, quantity }]);
    }

    Alert.alert("¡Agregado!", `${product.name} agregado al carrito`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find((item) => item.product.id === productId);
    if (item && newQuantity > item.product.stock) {
      Alert.alert("Stock insuficiente", "No hay suficiente stock disponible");
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Agrega productos antes de comprar");
      return;
    }

    Alert.alert(
      "Confirmar Compra",
      `Total: $${cartTotal.toFixed(2)}\n¿Proceder con la compra?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Comprar",
          onPress: () => {
            onPurchase?.(cart);
            setCart([]);
            setShowCart(false);
            Alert.alert("¡Compra exitosa!", "Tu pedido ha sido procesado");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con título y carrito */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tienda</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProducts.length} productos disponibles
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => setShowCart(true)}
        >
          <Ionicons name="cart" size={24} color={Colors.accent} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner promocional */}
      <View style={styles.promoBanner}>
        <View style={styles.promoIcon}>
          <Ionicons name="gift" size={24} color={Colors.accent} />
        </View>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Envío Gratis</Text>
          <Text style={styles.promoSubtitle}>En compras mayores a $30</Text>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
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

      {/* Categorías horizontales */}
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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid de productos */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsGrid}
      >
        {filteredProducts.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => setSelectedProduct(product)}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />

                {product.stock < 5 && (
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>
                      ¡Últimas unidades!
                    </Text>
                  </View>
                )}

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>

                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {product.rating.toFixed(1)} ({product.reviews})
                    </Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={Colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
              No se encontraron productos con esa búsqueda
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal detalle de producto */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContent}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setSelectedProduct(null);
                  setTempQuantity(1);
                }}
              >
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>

              <ScrollView>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.detailImage}
                />

                <View style={styles.detailInfo}>
                  <Text style={styles.detailName}>{selectedProduct.name}</Text>

                  <View style={styles.detailRating}>
                    <Ionicons name="star" size={18} color="#FFD700" />
                    <Text style={styles.detailRatingText}>
                      {selectedProduct.rating.toFixed(1)} (
                      {selectedProduct.reviews} reseñas)
                    </Text>
                  </View>

                  <Text style={styles.detailDescription}>
                    {selectedProduct.description}
                  </Text>

                  <View style={styles.stockInfo}>
                    <Ionicons
                      name="cube-outline"
                      size={18}
                      color={Colors.accent}
                    />
                    <Text style={styles.stockInfoText}>
                      {selectedProduct.stock} unidades disponibles
                    </Text>
                  </View>

                  <View style={styles.quantitySelector}>
                    <Text style={styles.quantityLabel}>Cantidad:</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        onPress={() =>
                          setTempQuantity(Math.max(1, tempQuantity - 1))
                        }
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={Colors.textPrimary}
                        />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{tempQuantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        onPress={() =>
                          setTempQuantity(
                            Math.min(selectedProduct.stock, tempQuantity + 1),
                          )
                        }
                      >
                        <Ionicons
                          name="add"
                          size={20}
                          color={Colors.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalPrice}>
                      ${(selectedProduct.price * tempQuantity).toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => {
                      addToCart(selectedProduct, tempQuantity);
                      setSelectedProduct(null);
                      setTempQuantity(1);
                    }}
                  >
                    <Ionicons
                      name="cart"
                      size={20}
                      color={Colors.textPrimary}
                    />
                    <Text style={styles.addToCartBtnText}>
                      Agregar al Carrito
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Modal carrito */}
      <Modal
        visible={showCart}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCart(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cartModalContent}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Mi Carrito</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="cart-outline"
                    size={64}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.emptyTitle}>Carrito vacío</Text>
                <Text style={styles.emptyDescription}>
                  Agrega productos para comenzar tu compra
                </Text>
              </View>
            ) : (
              <>
                <ScrollView>
                  {cart.map((item) => (
                    <View key={item.product.id} style={styles.cartItem}>
                      <Image
                        source={{ uri: item.product.image }}
                        style={styles.cartItemImage}
                      />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.cartItemPrice}>
                          ${item.product.price.toFixed(2)} c/u
                        </Text>

                        <View style={styles.cartItemControls}>
                          <View style={styles.cartQuantityControls}>
                            <TouchableOpacity
                              style={styles.cartQuantityBtn}
                              onPress={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Ionicons
                                name="remove"
                                size={16}
                                color={Colors.textPrimary}
                              />
                            </TouchableOpacity>
                            <Text style={styles.cartQuantityValue}>
                              {item.quantity}
                            </Text>
                            <TouchableOpacity
                              style={styles.cartQuantityBtn}
                              onPress={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                            >
                              <Ionicons
                                name="add"
                                size={16}
                                color={Colors.textPrimary}
                              />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            onPress={() => removeFromCart(item.product.id)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="#FF3B30"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.cartFooter}>
                  <View style={styles.cartTotal}>
                    <Text style={styles.cartTotalLabel}>Total:</Text>
                    <Text style={styles.cartTotalPrice}>
                      ${cartTotal.toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={handleCheckout}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.textPrimary}
                    />
                    <Text style={styles.checkoutBtnText}>Finalizar Compra</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  cartBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  promoBanner: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  promoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(212,175,55,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  promoContent: { flex: 1 },
  promoTitle: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },
  promoSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 15,
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
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.textPrimary,
  },
  productsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,149,0,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.accent,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  detailModalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailImage: {
    width: "100%",
    height: 300,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  detailInfo: {
    padding: 20,
  },
  detailName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  detailRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 15,
  },
  detailRatingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  stockInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quantitySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.accent,
  },
  addToCartBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addToCartBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  cartModalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cartItemControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartQuantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  cartQuantityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    minWidth: 25,
    textAlign: "center",
  },
  cartFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  cartTotalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.accent,
  },
  checkoutBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
