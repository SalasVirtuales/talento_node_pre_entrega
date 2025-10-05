// --> ndex.js
import { ProductManager } from './productManager.js';

class CommandLineInterface {
    constructor() {
        this.productManager = new ProductManager();
        this.args = process.argv.slice(2); // --> Remover 'node' e 'index.js'
    }

    // --> Procesar argumentos de la línea de comandos
    async processCommand() {
        if (this.args.length === 0) {
            this.showHelp();
            return;
        }

        const [method, recurso, ...parametro] = this.args;

        // --> Validar estructura básica del comando
        if (!method || !recurso) {
            console.error('Comando inválido. Use el formato: <METHOD> <recurso> [PARAmetroparametro]');
            this.showHelp();
            return;
        }

        // --> Procesar según el método HTTP
        try {
            switch (method.toUpperCase()) {
                case 'GET':
                    await this.handleGet(recurso, parametro);
                    break;
                
                case 'POST':
                    await this.handlePost(recurso, parametro);
                    break;
                
                case 'DELETE':
                    await this.handleDelete(recurso, parametro);
                    break;
                
                default:
                    console.error(`Método HTTP no soportado: ${method}`);
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error procesando comando:', error.message);
        }
    }

    // --> Manejar comandos GET
    async handleGet(recurso, parametro) {
        // Normalizar el recurso para aceptar tanto 'products' como 'productos'
        const normalizedrecurso = recurso === 'productos' ? 'products' : recurso;
        const normalizedrecursoPath = recurso.replace('productos/', 'products/');
        
        if (normalizedrecurso === 'products') {
            console.log('Obteniendo productos...\n');
            const products = await this.productManager.todosProductos();
            
            if (products) {
                console.log(this.productManager.formatProductList(products));
            }
        } else if (normalizedrecursoPath.startsWith('products/')) {
            // Extraer ID del producto usando destructuring
            const [, productId] = normalizedrecursoPath.split('/');
            
            if (!productId || isNaN(productId)) {
                console.error('ID de producto inválido');
                return;
            }

            console.log(`Obteniendo producto con ID: ${productId}...\n`);
            const product = await this.productManager.getProductById(productId);
            
            if (product) {
                console.log('Producto encontrado:');
                console.log(this.productManager.formatProduct(product));
            }
        } else {
            console.error(`Recurso no reconocido: ${recurso}`);
            console.log('Recursos válidos: products, productos');
        }
    }

    // --> Manejar comandos POST
    async handlePost(recurso, parametro) {
        // Normalizar el recurso para aceptar tanto 'products' como 'productos'
        const normalizedrecurso = recurso === 'productos' ? 'products' : recurso;
        
        if (normalizedrecurso === 'products') {
            // Usar destructuring para obtener los parámetros
            const [title, price, category, ...descriptionParts] = parametro;
            
            if (!title || !price || !category) {
                console.error('Faltan parámetros. Formato: POST products <title> <price> <category>');
                return;
            }

            // Validar precio
            if (isNaN(price) || parseFloat(price) <= 0) {
                console.error('El precio debe ser un número válido mayor a 0');
                return;
            }

            console.log('Creando nuevo producto...\n');
            
            // Usar spread operator para la descripción opcional
            const description = descriptionParts.length > 0 
                ? descriptionParts.join(' ') 
                : `Producto ${title} en categoría ${category}`;

            const newProduct = await this.productManager.createProduct(title, price, category, description);
            
            if (newProduct) {
                console.log('Producto creado exitosamente:');
                console.log(this.productManager.formatProduct(newProduct));
            }
        } else {
            console.error(`Recurso no soportado para POST: ${recurso}`);
            console.log('Recursos válidos: products, productos');
        }
    }

    // --> Manejar comandos DELETE
    async handleDelete(recurso, parametro) {
        // Normalizar el recurso para aceptar tanto 'products' como 'productos'
        const normalizedrecursoPath = recurso.replace('productos/', 'products/');
        
        if (normalizedrecursoPath.startsWith('products/')) {
            // Usar destructuring para extraer el ID
            const [, productId] = normalizedrecursoPath.split('/');
            
            if (!productId || isNaN(productId)) {
                console.error('ID de producto inválido');
                return;
            }

            console.log(`Eliminando producto con ID: ${productId}...\n`);
            const result = await this.productManager.deleteProduct(productId);
            
            if (result) {
                console.log('Producto eliminado exitosamente');
                console.log(`Respuesta del servidor:`, result);
            }
        } else {
            console.error(`Recurso no soportado para DELETE: ${recurso}`);
            console.log('Recursos válidos: products/<id>, productos/<id>');
        }
    }

    // --> Mostrar ayuda
    showHelp() {
        console.log(`
SISTEMA DE GESTIÓN DE PRODUCTOS - FakeStore API

COMANDOS DISPONIBLES VALIDOS PARA OPERAR CON PRODUCTOS:

   Listar todos los productos:
   npm run start GET products
   npm run start GET productos

   Obtener producto específico:
   npm run start GET products/<productId>
   npm run start GET productos/<productId>
   Ejemplo: npm run start GET productos/15

   Crear nuevo producto:
   npm run start POST products <title> <price> <category> [description]
   npm run start POST productos <title> <price> <category> [description]
   Ejemplo: npm run start POST productos "T-Shirt Rex" 300 "remeras"

   Eliminar producto:
   npm run start DELETE products/<productId>
   npm run start DELETE productos/<productId>
   Ejemplo: npm run start DELETE productos/7

NOTAS:
   • Los precios deben ser números válidos
   • Las categorías pueden ser: electronics, jewelery, men's clothing, women's clothing
   • La descripción es opcional para productos nuevos
   • Se acepta tanto 'products' como 'productos' en los comandos
        `);
    }
}

// Ejecutar la aplicación
async function main() {
    const cli = new CommandLineInterface();
    await cli.processCommand();
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Error no manejado:', reason);
    process.exit(1);
});

// Ejecutar aplicación principal
main().catch(error => {
    console.error('Error fatal:', error.message);
    process.exit(1);
});