// -->  productManager.js
const API_BASE_URL = 'https://fakestoreapi.com';

export class ProductManager {
    
    // --> Obtener todos los productos
    async todosProductos() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error al obtener productos:', error.message);
            return null;
        }
    }

    // -->  Obtener un producto específico por ID
    async getProductById(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const product = await response.json();
            return product;
        } catch (error) {
            console.error(`Error al obtener producto ${productId}:`, error.message);
            return null;
        }
    }

    // --> Crear un nuevo producto
    async createProduct(title, price, category, description = 'Producto creado desde la aplicación') {
        try {
            const newProduct = {
                title,
                price: parseFloat(price),
                description,
                image: 'https://i.pravatar.cc/640?img=placeholder',
                category
            };

            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProduct)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const createdProduct = await response.json();
            return createdProduct;
        } catch (error) {
            console.error('Error al crear producto:', error.message);
            return null;
        }
    }

    // -->  Eliminar un producto
    async deleteProduct(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Error al eliminar producto ${productId}:`, error.message);
            return null;
        }
    }

    // --> Formatear producto para mostrar
    formatProduct(product) {
        if (!product) return 'Producto no encontrado';
        
        return `
**************************************************************************************************************************
│ ID: ${product.id}
│ Título: ${product.title}
│ Precio: ${product.price}
│ Categoría: ${product.category}
│ Descripción: ${product.description?.substring(0, 100)}...
**************************************************************************************************************************`;
    }

    // --> Formatear lista de productos
    formatProductList(products) {
        if (!products || products.length === 0) {
            return 'No se encontraron productos';
        }

        const header = `\n PRODUCTOS DISPONIBLES (${products.length} items)\n${'='.repeat(50)}`;
        const productList = products.map(product => this.formatProduct(product)).join('\n');
        
        return header + productList;
    }
}