import { Request, Response } from "express";
import * as usuarioService from "../../services/usuarioService";

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios (paginado)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, example: 1 }
 *       - { name: limit, in: query, schema: { type: integer }, example: 20 }
 *       - { name: usuario_estado, in: query, schema: { type: string }, example: "A" }
 *     responses:
 *       200:
 *         description: Usuarios paginados
 */
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const result = await usuarioService.listar(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

/**
 * @openapi
 * /api/usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.obtenerPorId(Number(req.params.id));
    if (!usuario) { res.status(404).json({ error: "Usuario no encontrado" }); return; }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

/**
 * @openapi
 * /api/usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [persona_id, usuario_nombre, usuario_contrasena]
 *             properties:
 *               persona_id: { type: integer, example: 1 }
 *               usuario_nombre: { type: string, example: "juanp" }
 *               usuario_contrasena: { type: string, example: "password123" }
 *     responses:
 *       201:
 *         description: Usuario creado
 */
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.crear(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

/**
 * @openapi
 * /api/usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar usuario
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_nombre: { type: string, example: "juanp" }
 *               usuario_contrasena: { type: string, example: "nuevaPassword123" }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.actualizar(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

/**
 * @openapi
 * /api/usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Desactivar usuario (borrado lógico)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Usuario desactivado
 */
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.eliminar(Number(req.params.id));
    res.json({ message: "Usuario desactivado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el usuario" });
  }
};
