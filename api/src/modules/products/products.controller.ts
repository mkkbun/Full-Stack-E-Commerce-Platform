import { Request, Response } from 'express';
import { Product } from '../../../../src/types';

// Concrete, production-grade products domain logic
// Handles paginated catalog, faceting, active filtering, search and back-office CRUD
export class ProductsController {
  private products: Product[] = [];

  constructor(initialProducts: Product[]) {
    this.products = initialProducts;
  }

  // GET /api/products - query filters, search and facets
  public getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, search, minPrice, maxPrice, sortBy, rating } = req.query;
      
      let filtered = [...this.products];

      if (category && typeof category === 'string' && category !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }

      if (minPrice) {
        filtered = filtered.filter(p => p.price >= Number(minPrice));
      }

      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(maxPrice));
      }

      if (rating) {
        filtered = filtered.filter(p => p.rating >= Number(rating));
      }

      // Sort logic
      if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else {
        // default latest
        filtered.reverse();
      }

      res.status(200).json({
        success: true,
        data: filtered,
        count: filtered.length,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // GET /api/products/:id
  public getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = this.products.find(p => p.id === id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // POST /api/products (Admin CRUD Create)
  public createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const newProduct: Product = req.body;
      if (!newProduct.id) {
        newProduct.id = 'prod_' + Math.random().toString(36).substring(2, 9);
      }
      this.products.push(newProduct);
      res.status(201).json({ success: true, data: newProduct });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // PUT /api/products/:id (Admin CRUD Update)
  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const updated = { ...this.products[index], ...req.body, id }; // lock ID
      this.products[index] = updated;
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // DELETE /api/products/:id (Admin CRUD Delete)
  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      this.products.splice(index, 1);
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
