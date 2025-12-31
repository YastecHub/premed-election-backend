import { Router } from 'express';
import { getCandidates, postCandidate, removeCandidate } from '../controllers/candidateController';

export function createCandidatesRoutes() {
  const router = Router();
  /**
   * @openapi
   * /api/candidates:
   *   get:
   *     summary: Retrieve list of candidates
   *     tags:
   *       - Candidates
   *     responses:
   *       200:
   *         description: Array of candidate objects
   */
  router.get('/candidates', getCandidates);
  /**
   * @openapi
   * /api/candidates:
   *   post:
   *     summary: Create a new candidate
   *     tags:
   *       - Candidates
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               position:
   *                 type: string
   *               department:
   *                 type: string
   *               photoUrl:
   *                 type: string
   *               manifesto:
   *                 type: string
   *     responses:
   *       200:
   *         description: Created candidate
   */
  router.post('/candidates', postCandidate);
  /**
   * @openapi
   * /api/candidates/{id}:
   *   delete:
   *     summary: Delete a candidate by id
   *     tags:
   *       - Candidates
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Deletion result
   */
  router.delete('/candidates/:id', removeCandidate);
  return router;
}
