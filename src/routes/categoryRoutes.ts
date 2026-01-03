import { Router } from 'express';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { validateRequest, validateParam } from '../middlewares/validation';

export function createCategoryRoutes() {
  const router = Router();
  
  /**
   * @openapi
   * /api/categories:
   *   get:
   *     summary: Retrieve list of categories
   *     tags:
   *       - Categories
   *     responses:
   *       200:
   *         description: Array of category objects
   */
  router.get('/categories', getCategories);

  /**
   * @openapi
   * /api/categories/{id}:
   *   get:
   *     summary: Get a single category by ID
   *     tags:
   *       - Categories
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Category object
   *       404:
   *         description: Category not found
   */
  router.get('/categories/:id', validateParam('id'), getCategory);

  /**
   * @openapi
   * /api/categories:
   *   post:
   *     summary: Create a new category
   *     tags:
   *       - Categories
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created category
   *       400:
   *         description: Validation error or duplicate name
   */
  router.post('/categories', validateRequest('category'), createCategory);

  /**
   * @openapi
   * /api/categories/{id}:
   *   put:
   *     summary: Update a category by ID
   *     tags:
   *       - Categories
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated category
   *       404:
   *         description: Category not found
   *       400:
   *         description: Validation error or duplicate name
   */
  router.put('/categories/:id', validateParam('id'), validateRequest('category'), updateCategory);

  /**
   * @openapi
   * /api/categories/{id}:
   *   delete:
   *     summary: Delete a category by ID
   *     tags:
   *       - Categories
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Deletion result
   *       404:
   *         description: Category not found
   */
  router.delete('/categories/:id', validateParam('id'), deleteCategory);
  
  return router;
}