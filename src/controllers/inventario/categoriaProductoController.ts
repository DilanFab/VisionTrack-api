import { Request, Response } from "express";
import prisma from "../../config/prisma";

// Listar todas las categorías de productos
export const getCategoriasProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await prisma.tbl_categoria_producto.findMany({
      orderBy: { categoria_producto_nombre: "asc" },
    });
    res.json({ success: true, data: categorias });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener categorías de productos" });
  }
};

// Crear nueva categoría de producto
export const createCategoriaProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria_producto_nombre, categoria_producto_descripcion } = req.body;

    if (!categoria_producto_nombre || !categoria_producto_nombre.trim()) {
      res.status(400).json({ success: false, message: "El nombre de la categoría es obligatorio" });
      return;
    }

    const nuevaCategoria = await prisma.tbl_categoria_producto.create({
      data: {
        categoria_producto_nombre: categoria_producto_nombre.trim(),
        categoria_producto_descripcion: categoria_producto_descripcion ? categoria_producto_descripcion.trim() : null,
      },
    });

    res.status(201).json({ success: true, message: "Categoría creada con éxito", data: nuevaCategoria });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ success: false, message: "Ya existe una categoría con ese nombre" });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Error al crear la categoría" });
  }
};

// Actualizar categoría de producto
export const updateCategoriaProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { categoria_producto_nombre, categoria_producto_descripcion, categoria_producto_estado } = req.body;

    const categoriaExistente = await prisma.tbl_categoria_producto.findUnique({
      where: { categoria_producto_id: Number(id) },
    });

    if (!categoriaExistente) {
      res.status(404).json({ success: false, message: "Categoría no encontrada" });
      return;
    }

    const categoriaActualizada = await prisma.tbl_categoria_producto.update({
      where: { categoria_producto_id: Number(id) },
      data: {
        categoria_producto_nombre: categoria_producto_nombre !== undefined ? categoria_producto_nombre.trim() : undefined,
        categoria_producto_descripcion: categoria_producto_descripcion !== undefined ? categoria_producto_descripcion.trim() : undefined,
        categoria_producto_estado: categoria_producto_estado !== undefined ? categoria_producto_estado : undefined,
      },
    });

    res.json({ success: true, message: "Categoría actualizada correctamente", data: categoriaActualizada });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al actualizar la categoría" });
  }
};

// Eliminar categoría de producto
export const deleteCategoriaProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.tbl_categoria_producto.delete({
      where: { categoria_producto_id: Number(id) },
    });

    res.json({ success: true, message: "Categoría eliminada correctamente" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al eliminar la categoría" });
  }
};
