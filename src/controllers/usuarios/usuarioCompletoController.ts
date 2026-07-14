import { Request, Response } from "express";
import * as usuarioCompletoService from "../../services/usuarioCompletoService";

/**
 * @openapi
 * /api/usuarios-completos:
 *   get:
 *     tags: [UsuariosCompletos]
 *     summary: Listar usuarios completos
 *     responses:
 *       200:
 *         description: Lista de usuarios completos
 */
export const getUsuariosCompletos = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioCompletoService.listar();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

/**
 * @openapi
 * /api/usuarios-completos:
 *   post:
 *     tags: [UsuariosCompletos]
 *     summary: Crear usuario completo (persona + usuario + perfil)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona: { type: object, description: Datos de la persona }
 *               usuario: { type: object, description: Datos del usuario }
 *               rol_id: { type: integer, example: 3 }
 *     responses:
 *       201:
 *         description: Usuario completo creado
 *       400:
 *         description: Dato duplicado o validación fallida
 */
export const createUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioCompletoService.crear(req.body);
    res.status(201).json(usuario);
  } catch (error: any) {
    if (error.message?.includes("Ya existe") || error.message?.includes("ya está en uso")) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

/**
 * @openapi
 * /api/usuarios-completos/{id}:
 *   put:
 *     tags: [UsuariosCompletos]
 *     summary: Actualizar usuario completo
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona: { type: object }
 *               usuario: { type: object }
 *     responses:
 *       200:
 *         description: Usuario completo actualizado
 *       404:
 *         description: No encontrado
 */
export const updateUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioCompletoService.actualizar(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (error: any) {
    if (error.message?.includes("no encontrado")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

/**
 * @openapi
 * /api/usuarios-completos/{id}:
 *   delete:
 *     tags: [UsuariosCompletos]
 *     summary: Desactivar usuario completo
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Usuario completo desactivado
 */
export const deleteUsuarioCompleto = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioCompletoService.eliminar(Number(req.params.id));
    res.json({ message: "Usuario desactivado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar el usuario" });
  }
};
